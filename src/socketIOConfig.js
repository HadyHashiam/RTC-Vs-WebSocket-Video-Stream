const socketIo = require('socket.io');

function setupSocketIO(server) {
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['*'],
      credentials: true
    },
    path: '/socket.io'
  });

  io.on('connection', (socket) => {
    console.log(`Socket.IO: User connected: ${socket.id}`);
    try {
      socket.emit('peer-id', socket.id);
      console.log(`Socket.IO: Sent peer-id ${socket.id} to client`);
    } catch (err) {
      console.error(`Socket.IO: Error sending peer-id to ${socket.id}:`, err);
    }

    const validateTarget = (data, eventName) => {
      if (!data || !data.target || typeof data.target !== 'string') {
        console.error(`Socket.IO: Invalid target ID in ${eventName} from ${socket.id}`);
        socket.emit('error', { message: `Invalid target ID in ${eventName}` });
        return false;
      }
      return true;
    };

    socket.on('call-request', (data) => {
      if (!validateTarget(data, 'call-request')) return;
      console.log(`Socket.IO: Call request from ${socket.id} to ${data.target}`);
      socket.to(data.target).emit('call-request', { sender: socket.id });
    });

    socket.on('call-response', (data) => {
      if (!validateTarget(data, 'call-response')) return;
      console.log(`Socket.IO: Call response from ${socket.id} to ${data.target}: ${data.accepted}`);
      socket.to(data.target).emit('call-response', { sender: socket.id, accepted: data.accepted });
    });

    socket.on('offer', (data) => {
      if (!validateTarget(data, 'offer')) return;
      console.log(`Socket.IO: Offer from ${socket.id} to ${data.target}`);
      socket.to(data.target).emit('offer', { signal: data.signal, sender: socket.id });
    });

    socket.on('answer', (data) => {
      if (!validateTarget(data, 'answer')) return;
      console.log(`Socket.IO: Answer from ${socket.id} to ${data.target}`);
      socket.to(data.target).emit('answer', { signal: data.signal, sender: socket.id });
    });

    socket.on('ice-candidate', (data) => {
      if (!validateTarget(data, 'ice-candidate')) return;
      console.log(`Socket.IO: ICE candidate from ${socket.id} to ${data.target}`);
      socket.to(data.target).emit('ice-candidate', { candidate: data.candidate, sender: socket.id });
    });

    socket.on('end-call', (data) => {
      if (!validateTarget(data, 'end-call')) return;
      console.log(`Socket.IO: End call request from ${socket.id} to ${data.target}`);
      socket.to(data.target).emit('call-ended', { sender: socket.id });
    });

    socket.on('disconnect', () => {
      console.log(`Socket.IO: User disconnected: ${socket.id}`);
      io.emit('user-disconnected', socket.id);
    });

    socket.on('error', (err) => {
      console.error(`Socket.IO: Error for ${socket.id}:`, err);
    });
  });

  return io;
}

module.exports = { setupSocketIO };