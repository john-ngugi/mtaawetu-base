import json
import re
import requests
import os
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
from datetime import datetime
from channels.layers import get_channel_layer
from .utils import send_map_trigger  

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'map_chat'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        # Send loading bubble
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': {
                    'username': 'AI',
                    'message': '',
                    'timestamp': datetime.utcnow().isoformat(),
                    'isLoading': True,
                    'message_id': f"loading_{data['timestamp']}"
                },
            }
        )

        message_text = data['message'].lower().strip()
        if "zoom" in message_text:
            await self.process_zoom_request(message_text, data['username'], data['timestamp'])
        elif "centroid" in message_text:
            await self.process_centroid_request(message_text, data['username'], data['timestamp'])
        else:
            await self.process_conversational_request(message_text, data['username'], data['timestamp'])

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def send_ai_response(self, response_text, username, message_id):
        """Send final AI response"""
        logger.info(f"Sending final AI response: {response_text[:100]}...")
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': {
                    'username': 'AI',
                    'message': response_text,
                    'timestamp': datetime.utcnow().isoformat(),
                    'isLoading': False,
                    'message_id': f"ai_{message_id}"
                },
            }
        )

    async def process_zoom_request(self, message_text, username, message_id):
        try:
            # More flexible pattern matching
            patterns = [
                r".*zoom\s+(?:to|map\s+to)\s+([-+]?\d*\.?\d+)\s*,?\s*([-+]?\d*\.?\d+)\s*,?\s*(\d+)?",
                r".*center\s+(?:map\s+)?on\s+([-+]?\d*\.?\d+)\s*,?\s*([-+]?\d*\.?\d+)\s*,?\s*(\d+)?",
                r".*go\s+to\s+([-+]?\d*\.?\d+)\s*,?\s*([-+]?\d*\.?\d+)\s*,?\s*(\d+)?"
            ]
            
            for pattern in patterns:
                match = re.match(pattern, message_text, re.IGNORECASE)
                if match:
                    break
                    
            if not match:
                await self.send_ai_response(
                    "Please use format: zoom to <lng> <lat> [zoom level]",
                    username, 
                    message_id
                )
                return

            lng, lat = float(match.group(1)), float(match.group(2))
            zoom = int(match.group(3)) if match.group(3) else 12

            # Validate coordinates
            if not (-180 <= lng <= 180) or not (-90 <= lat <= 90):
                await self.send_ai_response(
                    "Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.",
                    username,
                    message_id
                )
                return

            if not (0 <= zoom <= 22):
                await self.send_ai_response(
                    "Zoom level must be between 0 and 22",
                    username,
                    message_id
                )
                return

            await send_map_trigger('zoomToLocation', {
                'lng': lng,
                'lat': lat, 
                'zoom': zoom
            }, username, message_id)

        except Exception as e:
            logger.error(f"Zoom error: {str(e)}", exc_info=True)
            await self.send_ai_response(
                f"Sorry, I couldn't process your zoom request: {str(e)}",
                username,
                message_id
            )

    async def process_centroid_request(self, message_text, username, message_id):
        try:
            match = re.match(r".*centroid\s+(.+)", message_text)
            if not match:
                await self.send_ai_response("Please provide: centroid <GeoJSON>", username, message_id)
                return

            geojson_str = match.group(1)
            json.loads(geojson_str)  # will raise if invalid

            from .utils import send_map_trigger
            await send_map_trigger('calculateCentroid', {'geojson': geojson_str}, username, message_id)

        except Exception as e:
            logger.error(f"Centroid error: {str(e)}", exc_info=True)
            await self.send_ai_response(f"Centroid error: {str(e)}", username, message_id)

    async def process_conversational_request(self, message_text, username, message_id):
        try:
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                await self.send_ai_response("Error: DEEPSEEK_API_KEY not set", username, message_id)
                return

            # Enhanced GIS-specific prompt
            prompt = f"""
            You are a GIS expert assistant helping users with map interactions and spatial analysis.
            The user has access to a MapLibre map that you can control through specific commands.
            
            Available Map Functions:
            1. zoomToLocation(lng, lat, zoom) - Centers map on coordinates
            2. addMarker(lng, lat, title) - Adds a marker to the map
            3. calculateCentroid(geojson) - Calculates centroid of GeoJSON
            4. addGeoJSONLayer(geojson, layerName) - Adds GeoJSON data as layer
            
            Current User Message: "{message_text}"
            
            Respond with:
            - If the message is a clear map command, return JSON with:
            {{
                "action": "map_command",
                "function": "<function_name>",
                "params": {{...}},
                "response": "<natural language response>"
            }}
            - For analysis/conversation, return JSON with:
            {{
                "action": "chat_response",
                "response": "<your response>"
            }}
            """

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": "deepseek-reasoner",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "response_format": {"type": "json_object"},
                "stream": False
            }

            logger.debug("Sending enhanced GIS request to DeepSeek")
            with requests.post(
                "https://api.deepseek.com/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=60
            ) as response:
                response.raise_for_status()
                data = response.json()
                response_content = json.loads(data["choices"][0]["message"]["content"])
                
                if response_content.get("action") == "map_command":
                    await send_map_trigger(
                        response_content["function"],
                        response_content["params"],
                        username,
                        message_id
                    )
                else:
                    await self.send_ai_response(
                        response_content["response"],
                        username,
                        message_id
                    )

        except Exception as e:
            logger.error(f"Chat error: {str(e)}", exc_info=True)
            await self.send_ai_response(
                f"Sorry, I encountered an error processing your request: {str(e)}",
                username,
                message_id
            )

class MapTriggerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'map_triggers'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        trigger = {
            'functionName': data['functionName'],
            'params': data.get('params', {}),
        }
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'trigger_message',
                'trigger': trigger,
            }
        )

    async def trigger_message(self, event):
        await self.send(text_data=json.dumps(event['trigger']))