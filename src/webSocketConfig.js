const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

function setupWebSocket() {
  const wsServer = http.createServer();
  const wss = new WebSocket.Server({ server: wsServer });
  const wsClients = new Map();

  wss.on('connection', (ws) => {
    const clientId = uuidv4();
    wsClients.set(clientId, ws);
    ws.clientId = clientId;
    try {
      ws.send(JSON.stringify({ type: 'id', id: clientId }));
      console.log(`WebSocket: Sent ID ${clientId} to client`);
    } catch (err) {
      console.error(`WebSocket: Error sending ID to ${clientId}:`, err);
    }
    console.log(`WebSocket client connected: ${clientId}`);

    ws.on('message', (message) => {
      try {
        if (message.length > 1000000) {
          console.error(`WebSocket: Message too large from ${clientId}`);
          ws.send(JSON.stringify({ type: 'error', message: 'Message too large' }));
          return;
        }
        const data = JSON.parse(message.toString());
        console.log(`WebSocket: Received message from ${clientId}:`, data.type);

        if (data.type === 'call-request') {
          const targetWs = wsClients.get(data.target);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({ type: 'call-request', sender: clientId }));
            console.log(`WebSocket: Call request from ${clientId} to ${data.target}`);
          } else {
            ws.send(JSON.stringify({ type: 'error', message: 'Target user not found or disconnected' }));
            console.log(`WebSocket: Call request failed: Target ${data.target} not found`);
          }
        } else if (data.type === 'call-response') {
          const targetWs = wsClients.get(data.target);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            ws.targetId = data.accepted ? data.target : null;
            if (data.accepted) {
              targetWs.targetId = clientId;
              targetWs.send(JSON.stringify({ type: 'call-response', sender: clientId, accepted: true }));
              ws.send(JSON.stringify({ type: 'call-response', sender: data.target, accepted: true }));
              console.log(`WebSocket: Call accepted between ${clientId} and ${data.target}`);
            } else {
              targetWs.send(JSON.stringify({ type: 'call-response', sender: clientId, accepted: false }));
              console.log(`WebSocket: Call rejected by ${clientId} to ${data.target}`);
            }
          } else {
            ws.send(JSON.stringify({ type: 'error', message: 'Target user not found or disconnected' }));
            console.log(`WebSocket: Call response failed: Target ${data.target} not found`);
          }
        } else if (data.type === 'video') {
          const targetWs = wsClients.get(ws.targetId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({ type: 'video', data: data.data }));
          }
        } else if (data.type === 'audio') {
          const targetWs = wsClients.get(ws.targetId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({ type: 'audio', data: data.data }));
          }
        } else if (data.type === 'camera-toggle') {
          const targetWs = wsClients.get(ws.targetId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({ type: 'camera-toggle', sender: clientId, enabled: data.enabled }));
            console.log(`WebSocket: Camera ${data.enabled ? 'enabled' : 'disabled'} by ${clientId} for ${ws.targetId}`);
          }
        } else if (data.type === 'mic-toggle') {
          const targetWs = wsClients.get(ws.targetId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({ type: 'mic-toggle', sender: clientId, enabled: data.enabled }));
            console.log(`WebSocket: Microphone ${data.enabled ? 'enabled' : 'disabled'} by ${clientId} for ${ws.targetId}`);
          }
        } else if (data.type === 'end-call') {
          const targetWs = wsClients.get(data.target);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({ type: 'call-ended', sender: clientId }));
            console.log(`WebSocket: End call from ${clientId} to ${data.target}`);
          }
        }
      } catch (err) {
        console.error(`WebSocket: Error processing message from ${clientId}:`, err);
        ws.send(JSON.stringify({ type: 'error', message: 'Error processing data' }));
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`WebSocket client disconnected: ${clientId}, code: ${code}, reason: ${reason || 'none'}`);
      wsClients.delete(clientId);
      const targetWs = wsClients.get(ws.targetId);
      if (targetWs && targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(JSON.stringify({ type: 'disconnected', id: clientId }));
      }
    });

    ws.on('error', (err) => {
      console.error(`WebSocket: Error for client ${clientId}:`, err);
    });
  });

  return wsServer;
}

module.exports = { setupWebSocket };