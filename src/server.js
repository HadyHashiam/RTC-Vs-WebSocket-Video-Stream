const { setupExpress } = require('./expressConfig');
const { setupSocketIO } = require('./socketIOConfig');
const { setupWebSocket } = require('./webSocketConfig');

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// Setup Express server
const { app, server } = setupExpress();

// Setup Socket.IO
setupSocketIO(server);

// Setup WebSocket
const wsServer = setupWebSocket();

// Start servers
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

wsServer.listen(WS_PORT, () => {
  console.log(`WebSocket server running on port ${WS_PORT}`);
});