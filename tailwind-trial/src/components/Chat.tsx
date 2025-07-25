import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import './ChatBubble.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as turf from '@turf/turf';


interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
  isLoading?: boolean;
  message_id?: string;
}

interface FunctionTrigger {
  functionName: string;
  params?: any;
}

const functionRegistry: { [key: string]: (map: Map, params?: any) => void } = {
  zoomToLocation: (map: Map, params: { lng: number; lat: number; zoom: number }) => {
    map.flyTo({ 
      center: [params.lng, params.lat], 
      zoom: params.zoom,
      essential: true
    });
  },
  
  addMarker: (map: Map, params: { lng: number; lat: number; title: string, color?: string }) => {
    const marker = new maplibregl.Marker({
      color: params.color || '#3FB1CE'
    })
      .setLngLat([params.lng, params.lat])
      .setPopup(new maplibregl.Popup().setText(params.title))
      .addTo(map);
      
    // Fly to the marker if it's far from current view
    const currentCenter = map.getCenter();
    const distance = turf.distance(
      turf.point([currentCenter.lng, currentCenter.lat]),
      turf.point([params.lng, params.lat])
    );
    
    if (distance > 100) { // 100km threshold
      map.flyTo({
        center: [params.lng, params.lat],
        zoom: Math.max(10, map.getZoom())
      });
    }
  },
  
  calculateCentroid: (map: Map, params: { geojson: any }) => {
    try {
      const features = params.geojson.features || [params.geojson];
      const centroids = features.map((feature: any) => {
        const centroid = turf.centroid(feature);
        return {
          lng: centroid.geometry.coordinates[0],
          lat: centroid.geometry.coordinates[1]
        };
      });
      
      // Add all centroids to map
      centroids.forEach((centroid: any) => {
        new maplibregl.Marker({ color: '#FF0000' })
          .setLngLat([centroid.lng, centroid.lat])
          .setPopup(new maplibregl.Popup().setText('Centroid'))
          .addTo(map);
      });
      
      // Zoom to show all centroids
      const bbox = turf.bbox(turf.featureCollection(centroids.map((c: any) => 
        turf.point([c.lng, c.lat])
      )));
      map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
        padding: 50
      });
      
    } catch (e) {
      console.error('Centroid calculation error:', e);
    }
  },
  
  addGeoJSONLayer: (map: Map, params: { geojson: any, layerName: string }) => {
    if (map.getLayer(params.layerName)) {
      map.removeLayer(params.layerName);
      map.removeSource(params.layerName);
    }
    
    map.addSource(params.layerName, {
      type: 'geojson',
      data: params.geojson
    });
    
    map.addLayer({
      id: params.layerName,
      type: 'fill',
      source: params.layerName,
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.4
      }
    });
  }
};

interface ChatBubbleProps {
  map: Map | null;
  username: string;
}

// Error boundary component to catch ReactMarkdown errors
const MarkdownErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return <div>Error rendering message content</div>;
  }
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ map, username }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatWs = useRef<WebSocket | null>(null);
  const triggerWs = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const api = import.meta.env.VITE_WS_API_URL;

  useEffect(() => {
    chatWs.current = new WebSocket(api);
    chatWs.current.onopen = () => console.log('Chat WebSocket connected');
    chatWs.current.onmessage = (event) => {
      try {
        console.log('Raw WebSocket message:', event.data);
        const data: ChatMessage = JSON.parse(event.data);
        setMessages((prev) => {
          const updated = [...prev];
          const baseId = data.message_id?.replace(/^(loading_|ai_)/, '');

          const existingIndex = updated.findIndex(
            (msg) =>
              msg.message_id === `ai_${baseId}` ||
              msg.message_id === `loading_${baseId}`
          );

          console.log('Processing message:', { baseId, message_id: data.message_id, message: data.message });

          if (existingIndex >= 0) {
            const existingMsg = updated[existingIndex];
            updated[existingIndex] = {
              ...existingMsg,
              message: data.message,
              isLoading: false,
            };
          } else {
            updated.push(data);
          }
          return updated;
        });
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };
    chatWs.current.onclose = () => console.log('Chat WebSocket disconnected');

    triggerWs.current = new WebSocket('ws://localhost:8000/ws/map-triggers/');
    triggerWs.current.onopen = () => console.log('Trigger WebSocket connected');
    triggerWs.current.onmessage = (event) => {
      try {
        const trigger: FunctionTrigger = JSON.parse(event.data);
        if (map && functionRegistry[trigger.functionName]) {
          functionRegistry[trigger.functionName](map, trigger.params);
        }
      } catch (error) {
        console.error('Error parsing trigger:', error);
      }
    };

    return () => {
      chatWs.current?.close();
      triggerWs.current?.close();
    };
  }, [map, api, username]);

  useEffect(() => {
    if (messagesEndRef.current) {
      console.log('Scrolling to:', messagesEndRef.current);
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && chatWs.current?.readyState === WebSocket.OPEN) {
      const ts = new Date().toISOString();
      const userMessage: ChatMessage = {
        username,
        message: inputMessage,
        timestamp: ts,
        isLoading: false,
        message_id: `user_${ts}`,
      };

      // Send user message
      setMessages((prev) => [...prev, userMessage]);
      chatWs.current.send(
        JSON.stringify({
          ...userMessage,
          message_id: ts,
        })
      );

      // Show AI loading placeholder
      setMessages((prev) => [
        ...prev,
        {
          username: 'AI',
          message: '',
          timestamp: ts,
          isLoading: true,
          message_id: `loading_${ts}`,
        },
      ]);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="chat-bubble">
      <div className="chat-header">Map Chat</div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={msg.message_id || index}
            className={`message ${msg.username === username ? 'sent' : 'received'}`}
          >
            <strong>{msg.username}</strong>
            {msg.isLoading ? (
              <>
                <div className="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
                <div className="typing-indicator">AI is responding...</div>
              </>
            ) : (
              <MarkdownErrorBoundary>
                <ReactMarkdown>{msg.message}</ReactMarkdown>
              </MarkdownErrorBoundary>
            )}
            <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBubble;