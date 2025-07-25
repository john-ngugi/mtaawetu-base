import json
import os
import requests
from channels.layers import get_channel_layer
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

async def send_map_trigger(functionName, params, username="AI", message_id=None):
    logger.debug(f"Sending map trigger: functionName={functionName}, params={params}, message_id={message_id}")
    try:
        timestamp = datetime.utcnow().isoformat()

        # Send loading bubble immediately
        channel_layer = get_channel_layer()
        await channel_layer.group_send("map_chat", {
            "type": "chat_message",
            "message": {
                "username": username,
                "message": "",
                "timestamp": timestamp,
                "isLoading": True,
                "message_id": f"loading_{message_id}"
            }
        })

        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            logger.error("DEEPSEEK_API_KEY not set")
            await channel_layer.group_send(
                "map_chat",
                {
                    "type": "chat_message",
                    "message": {
                        "username": username,
                        "message": "Error: DEEPSEEK_API_KEY not set",
                        "timestamp": timestamp,
                        "isLoading": False,
                        "message_id": f"ai_{message_id}"
                    },
                }
            )
            return

        base_url = "https://api.deepseek.com/v1"
        model = "deepseek-reasoner"
        temperature = 0.7

        prompt = f"""
        Validate the following JSON map trigger data for a GIS application:
        Function Name: {functionName}
        Parameters: {json.dumps(params)}

        Requirements:
        - For 'zoomToLocation', ensure 'lng' is between -180 and 180, 'lat' is between -90 and 90, and 'zoom' is an integer between 0 and 20.
        - For 'addMarker', ensure 'lng' is between -180 and 180, 'lat' is between -90 and 90, and 'title' is a non-empty string.
        - For 'calculateCentroid', expect 'geojson' as a GeoJSON string and return centroid coordinates {{'lng': float, 'lat': float}}.
        - Return a JSON object with:
          - 'valid': boolean
          - 'params': dict (formatted data or empty if invalid)
          - 'response': str (text response for chat, e.g., 'Zoomed to location!')
        - If invalid, include 'error': str with the reason.
        Example valid response: {{"valid": true, "params": {{"lng": -47.0616, "lat": -22.9064, "zoom": 10}}, "response": "Zoomed to location!"}}
        """

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "response_format": {"type": "json_object"},
            "stream": False
        }

        logger.debug(f"Sending DeepSeek R1 request: {json.dumps(payload, indent=2)}")
        with requests.post(
            f"{base_url}/chat/completions",
            json=payload,
            headers=headers,
            timeout=60
        ) as response:
            response.raise_for_status()
            result_data = response.json()
            result_data = json.loads(result_data["choices"][0]["message"]["content"])

        logger.info(f"Sent chat response: {result_data['response']}")
        if result_data.get("valid", False):
            await channel_layer.group_send(
                "map_triggers",
                {
                    "type": "trigger_message",
                    "trigger": {
                        "functionName": functionName,
                        "params": result_data["params"],
                    },
                }
            )
            await channel_layer.group_send(
                "map_chat",
                {
                    "type": "chat_message",
                    "message": {
                        "username": username,
                        "message": result_data["response"],
                        "timestamp": timestamp,
                        "isLoading": False,
                        "message_id": f"ai_{message_id}"
                    },
                }
            )
            logger.info(f"Sent map trigger: {functionName} with params {result_data['params']}")
        else:
            logger.error(f"DeepSeek R1 validation failed: {result_data.get('error', 'Unknown error')}")
            await channel_layer.group_send(
                "map_chat",
                {
                    "type": "chat_message",
                    "message": {
                        "username": username,
                        "message": f"Failed: {result_data.get('error', 'Unknown error')}",
                        "timestamp": timestamp,
                        "isLoading": False,
                        "message_id": f"ai_{message_id}"
                    },
                }
            )

    except requests.exceptions.RequestException as e:
        logger.error(f"DeepSeek R1 API error: {str(e)}", exc_info=True)
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            "map_chat",
            {
                "type": "chat_message",
                "message": {
                    "username": username,
                    "message": f"Error processing trigger: {str(e)}",
                    "timestamp": timestamp,
                    "isLoading": False,
                    "message_id": f"ai_{message_id}"
                },
            }
        )

    except Exception as e:
        logger.error(f"Error sending map trigger: {str(e)}", exc_info=True)
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            "map_chat",
            {
                "type": "chat_message",
                "message": {
                    "username": username,
                    "message": f"Error processing trigger: {str(e)}",
                    "timestamp": timestamp,
                    "isLoading": False,
                    "message_id": f"ai_{message_id}"
                },
            }
        )