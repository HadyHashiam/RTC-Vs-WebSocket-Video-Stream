document.addEventListener('DOMContentLoaded', () => {
  const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    forceNew: false,
    path: '/socket.io'
  });

  // DOM elements for WebRTC
  const localVideo = document.getElementById('localVideo-rtc');
  const remoteVideo = document.getElementById('remoteVideo-rtc');
  const startCallButton = document.getElementById('startCall-rtc');
  const endCallButton = document.getElementById('endCall-rtc');
  const remotePeerIdInput = document.getElementById('remotePeerId-rtc');
  const myPeerIdSpan = document.getElementById('myPeerId-rtc');
  const callStatus = document.getElementById('callStatus-rtc');
  const callRequest = document.getElementById('callRequest-rtc');
  const callRequestMessage = document.getElementById('callRequestMessage-rtc');
  const acceptCallButton = document.getElementById('acceptCall-rtc');
  const rejectCallButton = document.getElementById('rejectCall-rtc');
  const toggleMicButton = document.getElementById('toggleMic-rtc');
  const toggleCamButton = document.getElementById('toggleCam-rtc');
  const copyPeerIdButton = document.getElementById('copyPeerId-rtc');
  const toast = document.getElementById('toast');

  let localStream;
  let peer;
  let currentCaller;
  let micEnabled = true;
  let camEnabled = true;

  // Check DOM elements
  if (!localVideo || !remoteVideo || !startCallButton || !endCallButton || !remotePeerIdInput ||
      !myPeerIdSpan || !callStatus || !callRequest || !callRequestMessage ||
      !acceptCallButton || !rejectCallButton || !toggleMicButton || !toggleCamButton || !toast) {
    console.error('WebRTC: One or more DOM elements are missing');
    if (callStatus) callStatus.textContent = 'Error: Interface elements not found';
    return;
  }

  // Show toast notification
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Initialize media stream
  async function init() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideo.srcObject = localStream;
      console.log('WebRTC: Local stream initialized');
      callStatus.textContent = 'Camera and microphone ready';
      callStatus.classList.add('bg-green-100', 'text-green-700');
    } catch (err) {
      console.error('WebRTC: Error accessing media devices:', err);
      callStatus.textContent = 'Error: Could not access camera/microphone';
      callStatus.classList.add('bg-red-100', 'text-red-700');
    }
  }

  // Toggle microphone
  toggleMicButton.addEventListener('click', () => {
    if (localStream) {
      micEnabled = !micEnabled;
      localStream.getAudioTracks().forEach(track => track.enabled = micEnabled);
      toggleMicButton.innerHTML = micEnabled
        ? '<i class="fas fa-microphone mr-2"></i>Mic On'
        : '<i class="fas fa-microphone-slash mr-2"></i>Mic Off';
      toggleMicButton.classList.toggle('bg-gray-600', micEnabled);
      toggleMicButton.classList.toggle('bg-red-600', !micEnabled);
      showToast(micEnabled ? 'Microphone enabled' : 'Microphone disabled');
      console.log(`WebRTC: Microphone ${micEnabled ? 'enabled' : 'disabled'}`);
    }
  });

  // Toggle camera
  toggleCamButton.addEventListener('click', () => {
    if (localStream) {
      camEnabled = !camEnabled;
      localStream.getVideoTracks().forEach(track => track.enabled = camEnabled);
      toggleCamButton.innerHTML = camEnabled
        ? '<i class="fas fa-video mr-2"></i>Cam On'
        : '<i class="fas fa-video-slash mr-2"></i>Cam Off';
      toggleCamButton.classList.toggle('bg-gray-600', camEnabled);
      toggleCamButton.classList.toggle('bg-red-600', !camEnabled);
      showToast(camEnabled ? 'Camera enabled' : 'Camera disabled');
      console.log(`WebRTC: Camera ${camEnabled ? 'enabled' : 'disabled'}`);
    }
  });

  // Copy Peer ID
  copyPeerIdButton.addEventListener('click', () => {
    const peerId = myPeerIdSpan.textContent;
    if (peerId && peerId !== 'Loading...') {
      navigator.clipboard.writeText(peerId).then(() => {
        showToast('Peer ID copied to clipboard');
        console.log('WebRTC: Peer ID copied:', peerId);
      }).catch(err => {
        console.error('WebRTC: Error copying Peer ID:', err);
        showToast('Error copying Peer ID');
      });
    } else {
      showToast('No Peer ID available to copy');
    }
  });

  // Show call request UI
  function showCallRequest(sender) {
    console.log('WebRTC: Showing call request UI for:', sender);
    callRequestMessage.textContent = `Incoming call from ${sender}`;
    callRequest.classList.remove('hidden');
    callStatus.textContent = `Incoming call from ${sender}`;
    callStatus.classList.add('bg-blue-100', 'text-blue-700');
  }

  // Hide call request UI
  function hideCallRequest() {
    callRequest.classList.add('hidden');
    callRequestMessage.textContent = '';
  }

  // End call
  function endCall() {
    if (peer) {
      peer.destroy();
      peer = null;
      remoteVideo.srcObject = null;
      callStatus.textContent = 'Call ended';
      callStatus.classList.add('bg-gray-100', 'text-gray-700');
      endCallButton.classList.add('hidden');
      startCallButton.classList.remove('hidden');
      if (currentCaller) {
        socket.emit('end-call', { target: currentCaller });
        currentCaller = null;
      }
      hideCallRequest();
    }
  }

  // Handle socket connection
  socket.on('connect', () => {
    console.log('WebRTC: Socket.IO connected:', socket.id);
    if (myPeerIdSpan) {
      myPeerIdSpan.textContent = socket.id;
      callStatus.textContent = 'Ready to make or receive calls';
      callStatus.classList.add('bg-green-100', 'text-green-700');
    } else {
      console.error('WebRTC: myPeerIdSpan not found');
      callStatus.textContent = 'Error: Interface not fully loaded';
      callStatus.classList.add('bg-red-100', 'text-red-700');
    }
  });

  // Handle peer-id event
  socket.on('peer-id', (id) => {
    console.log('WebRTC: Received peer-id:', id);
    if (myPeerIdSpan) {
      myPeerIdSpan.textContent = id;
      callStatus.textContent = 'Connected to server, ready to call';
      callStatus.classList.add('bg-green-100', 'text-green-700');
    } else {
      console.error('WebRTC: myPeerIdSpan not found for peer-id');
      callStatus.textContent = 'Error: Interface not fully loaded';
      callStatus.classList.add('bg-red-100', 'text-red-700');
    }
  });

  // Handle incoming call request
  socket.on('call-request', (data) => {
    console.log('WebRTC: Received call request from:', data.sender);
    currentCaller = data.sender;
    if (document.hasFocus()) {
      showCallRequest(data.sender);
    } else {
      console.log('WebRTC: Page not focused, prompting user to focus');
      callStatus.textContent = 'Incoming call received, please focus this tab';
      callStatus.classList.add('bg-yellow-100', 'text-yellow-700');
      setTimeout(() => {
        if (document.hasFocus()) {
          showCallRequest(data.sender);
        } else {
          console.log('WebRTC: Page still not focused, rejecting call');
          socket.emit('call-response', { target: data.sender, accepted: false });
          callStatus.textContent = 'Call rejected: Please focus this tab';
          callStatus.classList.add('bg-red-100', 'text-red-700');
        }
      }, 5000);
    }
  });

  // Handle accept call
  acceptCallButton.addEventListener('click', () => {
    if (!currentCaller) {
      console.error('WebRTC: No current caller to accept');
      callStatus.textContent = 'Error: No incoming call';
      callStatus.classList.add('bg-red-100', 'text-red-700');
      return;
    }
    console.log('WebRTC: Call accepted by user');
    socket.emit('call-response', { target: currentCaller, accepted: true });
    hideCallRequest();
    console.log('WebRTC: Initializing SimplePeer as answerer');
    endCallButton.classList.remove('hidden');
    startCallButton.classList.add('hidden');

    peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', (signalData) => {
      console.log('WebRTC: Signal event:', signalData);
      if (signalData.type === 'answer') {
        socket.emit('answer', { target: currentCaller, signal: signalData });
      } else if (signalData.candidate) {
        socket.emit('ice-candidate', { target: currentCaller, candidate: signalData });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log('WebRTC: Received remote stream');
      remoteVideo.srcObject = remoteStream;
      callStatus.textContent = 'Connected';
      callStatus.classList.add('bg-green-100', 'text-green-700');
    });

    peer.on('error', (err) => {
      console.error('WebRTC: SimplePeer error:', err);
      callStatus.textContent = 'Call error';
      callStatus.classList.add('bg-red-100', 'text-red-700');
      endCall();
    });

    peer.on('close', () => {
      console.log('WebRTC: Call closed');
      endCall();
    });
  });

  // Handle reject call
  rejectCallButton.addEventListener('click', () => {
    console.log('WebRTC: Call rejected by user');
    socket.emit('call-response', { target: currentCaller, accepted: false });
    hideCallRequest();
    callStatus.textContent = 'Call rejected';
    callStatus.classList.add('bg-red-100', 'text-red-700');
  });

  // Handle call response
  socket.on('call-response', (data) => {
    console.log(`WebRTC: Call response from ${data.sender}: ${data.accepted}`);
    if (data.accepted) {
      console.log('WebRTC: Call accepted, initializing SimplePeer as initiator');
      callStatus.textContent = 'Call accepted, connecting...';
      callStatus.classList.add('bg-blue-100', 'text-blue-700');
      endCallButton.classList.remove('hidden');
      startCallButton.classList.add('hidden');
      peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (signalData) => {
        console.log('WebRTC: Signal event:', signalData);
        if (signalData.type === 'offer') {
          socket.emit('offer', { target: data.sender, signal: signalData });
        } else if (signalData.candidate) {
          socket.emit('ice-candidate', { target: data.sender, candidate: signalData });
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('WebRTC: Connected to remote stream');
        remoteVideo.srcObject = remoteStream;
        callStatus.textContent = 'Connected';
        callStatus.classList.add('bg-green-100', 'text-green-700');
      });

      peer.on('error', (err) => {
        console.error('WebRTC: SimplePeer error:', err);
        callStatus.textContent = 'Call error';
        callStatus.classList.add('bg-red-100', 'text-red-700');
        endCall();
      });

      peer.on('close', () => {
        console.log('WebRTC: Call closed');
        endCall();
      });
    } else {
      console.log('WebRTC: Call rejected by remote user');
      callStatus.textContent = 'Call rejected by remote user';
      callStatus.classList.add('bg-red-100', 'text-red-700');
    }
  });

  // Start a call
  startCallButton.addEventListener('click', () => {
    const remotePeerId = remotePeerIdInput.value.trim();
    if (!remotePeerId) {
      console.log('WebRTC: Remote peer ID is empty');
      alert('Please enter a remote peer ID');
      callStatus.textContent = 'Error: Remote peer ID is empty';
      callStatus.classList.add('bg-red-100', 'text-red-700');
      return;
    }
    if (remotePeerId === myPeerIdSpan.textContent) {
      console.log('WebRTC: Cannot call yourself');
      alert('You cannot call yourself');
      callStatus.textContent = 'Error: Cannot call yourself';
      callStatus.classList.add('bg-red-100', 'text-red-700');
      return;
    }
    console.log('WebRTC: Sending call request to:', remotePeerId);
    callStatus.textContent = 'Sending call request...';
    callStatus.classList.add('bg-blue-100', 'text-blue-700');
    socket.emit('call-request', { target: remotePeerId });
  });

  // Handle signaling
  socket.on('offer', (data) => {
    console.log('WebRTC: Received offer from:', data.sender);
    if (peer) {
      peer.signal(data.signal);
    } else {
      console.error('WebRTC: No peer instance for offer');
      callStatus.textContent = 'Error: No peer instance for offer';
      callStatus.classList.add('bg-red-100', 'text-red-700');
    }
  });

  socket.on('answer', (data) => {
    console.log('WebRTC: Received answer from:', data.sender);
    if (peer) {
      peer.signal(data.signal);
    } else {
      console.error('WebRTC: No peer instance for answer');
      callStatus.textContent = 'Error: No peer instance for answer';
      callStatus.classList.add('bg-red-100', 'text-red-700');
    }
  });

  socket.on('ice-candidate', (data) => {
    console.log('WebRTC: Received ICE candidate from:', data.sender);
    if (peer) {
      peer.signal(data.candidate);
    } else {
      console.error('WebRTC: No peer instance for ICE candidate');
      callStatus.textContent = 'Error: No peer instance for ICE candidate';
      callStatus.classList.add('bg-red-100', 'text-red-700');
    }
  });

  socket.on('call-ended', (data) => {
    console.log('WebRTC: Call ended by:', data.sender);
    endCall();
  });

  socket.on('user-disconnected', (userId) => {
    console.log('WebRTC: User disconnected:', userId);
    endCall();
  });

  socket.on('error', (data) => {
    console.error('WebRTC: Server error:', data.message);
    callStatus.textContent = `Error: ${data.message}`;
    callStatus.classList.add('bg-red-100', 'text-red-700');
  });

  socket.on('connect_error', (err) => {
    console.error('WebRTC: Socket.IO connect error:', err.message);
    callStatus.textContent = `Socket.IO connection error: ${err.message}. Retrying...`;
    callStatus.classList.add('bg-red-100', 'text-red-700');
  });

  socket.on('reconnect', (attempt) => {
    console.log(`WebRTC: Reconnected after ${attempt} attempts`);
    callStatus.textContent = 'Reconnected to server';
    callStatus.classList.add('bg-green-100', 'text-green-700');
  });

  socket.on('reconnect_failed', () => {
    console.error('WebRTC: Reconnection failed');
    callStatus.textContent = 'Failed to reconnect to server';
    callStatus.classList.add('bg-red-100', 'text-red-700');
  });

  // Handle end call button
  endCallButton.addEventListener('click', () => {
    console.log('WebRTC: End call button clicked');
    endCall();
  });

  // Initialize
  init();
});