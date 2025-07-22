document.addEventListener('DOMContentLoaded', () => {
  const ws = new WebSocket('ws://localhost:3001');

  // DOM elements for WebSocket
  const localVideo = document.getElementById('localVideo-ws');
  const remoteVideo = document.getElementById('remoteVideo-ws');
  const startCallButton = document.getElementById('startCall-ws');
  const endCallButton = document.getElementById('endCall-ws');
  const userIdSpan = document.getElementById('userId-ws');
  const targetIdInput = document.getElementById('targetId-ws');
  const status = document.getElementById('status-ws');
  const toggleMicButton = document.getElementById('toggleMic-ws');
  const toggleCamButton = document.getElementById('toggleCam-ws');
  const copyUserIdButton = document.getElementById('copyUserId-ws');
  const toast = document.getElementById('toast');
  const callRequest = document.getElementById('callRequest-ws');
  const callRequestMessage = document.getElementById('callRequestMessage-ws');
  const acceptCallButton = document.getElementById('acceptCall-ws');
  const rejectCallButton = document.getElementById('rejectCall-ws');

  let localStream;
  let videoInterval;
  let audioContext;
  let audioInterval;
  let micEnabled = true;
  let camEnabled = true;
  let currentCaller;
  let targetId;

  // Check DOM elements
  if (!localVideo || !remoteVideo || !startCallButton || !endCallButton || !userIdSpan || !targetIdInput || !status ||
      !toggleMicButton || !toggleCamButton || !copyUserIdButton || !toast || !callRequest || !callRequestMessage ||
      !acceptCallButton || !rejectCallButton) {
    console.error('WebSocket: One or more DOM elements are missing');
    if (status) status.textContent = 'Error: Interface elements not found';
    return;
  }

  // Show toast notification
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Show call request UI
  function showCallRequest(sender) {
    console.log('WebSocket: Showing call request UI for:', sender);
    callRequestMessage.textContent = `Incoming call from ${sender}`;
    callRequest.classList.remove('hidden');
    status.textContent = `Incoming call from ${sender}`;
    status.classList.add('bg-blue-100', 'text-blue-700');
  }

  // Hide call request UI
  function hideCallRequest() {
    callRequest.classList.add('hidden');
    callRequestMessage.textContent = '';
  }

  async function startVideo() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideo.srcObject = localStream;
      status.textContent = 'Camera and microphone accessed';
      status.classList.add('bg-green-100', 'text-green-700');
      console.log('WebSocket: Camera and microphone accessed successfully');

      // Setup video streaming
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 225;
      const ctx = canvas.getContext('2d');

      videoInterval = setInterval(() => {
        if (!localStream.active || !camEnabled) {
          console.log('WebSocket: Camera stream is not active or camera disabled');
          return;
        }
        ctx.drawImage(localVideo, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.4);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'video', data: imageData }));
        }
      }, 200);

      // Setup audio streaming
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(localStream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (!micEnabled || !localStream.active) return;
        const audioData = e.inputBuffer.getChannelData(0);
        const buffer = new Float32Array(audioData).buffer;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'audio', data: Array.from(new Float32Array(buffer)) }));
        }
      };

    } catch (err) {
      console.error('WebSocket: Error accessing media:', err);
      status.textContent = 'Error accessing media: ' + err.message;
      status.classList.add('bg-red-100', 'text-red-700');
    }
  }

  function endCall() {
    if (videoInterval) {
      clearInterval(videoInterval);
      videoInterval = null;
    }
    if (audioInterval) {
      clearInterval(audioInterval);
      audioInterval = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    remoteVideo.src = '';
    status.textContent = 'Call ended';
    status.classList.add('bg-gray-100', 'text-gray-700');
    endCallButton.classList.add('hidden');
    startCallButton.classList.remove('hidden');
    if (targetId) {
      ws.send(JSON.stringify({ type: 'end-call', target: targetId }));
      targetId = null;
    }
    currentCaller = null;
    hideCallRequest();
  }

  function connectToUser() {
    const target = targetIdInput.value.trim();
    if (!target) {
      console.log('WebSocket: Target ID is empty');
      status.textContent = 'Please enter a target user ID';
      status.classList.add('bg-red-100', 'text-red-700');
      alert('Please enter a target user ID');
      return;
    }
    if (target === userIdSpan.textContent) {
      console.log('WebSocket: Cannot call yourself');
      status.textContent = 'Error: Cannot call yourself';
      status.classList.add('bg-red-100', 'text-red-700');
      alert('You cannot call yourself');
      return;
    }
    ws.send(JSON.stringify({ type: 'call-request', target }));
    status.textContent = 'Sending call request...';
    status.classList.add('bg-blue-100', 'text-blue-700');
    console.log(`WebSocket: Sending call request to ${target}`);
  }

  // Toggle microphone
  toggleMicButton.addEventListener('click', () => {
    micEnabled = !micEnabled;
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = micEnabled);
    }
    toggleMicButton.innerHTML = micEnabled
      ? '<i class="fas fa-microphone mr-2"></i>Mic On'
      : '<i class="fas fa-microphone-slash mr-2"></i>Mic Off';
    toggleMicButton.classList.toggle('bg-gray-600', micEnabled);
    toggleMicButton.classList.toggle('bg-red-600', !micEnabled);
    showToast(micEnabled ? 'Microphone enabled' : 'Microphone disabled');
    console.log(`WebSocket: Microphone ${micEnabled ? 'enabled' : 'disabled'}`);
    // Notify server about microphone toggle
    if (targetId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'mic-toggle', target: targetId, enabled: micEnabled }));
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
      console.log(`WebSocket: Camera ${camEnabled ? 'enabled' : 'disabled'}`);
      // Notify server about camera toggle
      if (targetId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'camera-toggle', target: targetId, enabled: camEnabled }));
      }
    }
  });

  // Copy User ID
  copyUserIdButton.addEventListener('click', () => {
    const userId = userIdSpan.textContent;
    if (userId && userId !== 'Loading...') {
      navigator.clipboard.writeText(userId).then(() => {
        showToast('User ID copied to clipboard');
        console.log('WebSocket: User ID copied:', userId);
      }).catch(err => {
        console.error('WebSocket: Error copying User ID:', err);
        showToast('Error copying User ID');
      });
    } else {
      showToast('No User ID available to copy');
    }
  });

  // Handle accept call
  acceptCallButton.addEventListener('click', () => {
    if (!currentCaller) {
      console.error('WebSocket: No current caller to accept');
      status.textContent = 'Error: No incoming call';
      status.classList.add('bg-red-100', 'text-red-700');
      return;
    }
    console.log('WebSocket: Call accepted by user');
    ws.send(JSON.stringify({ type: 'call-response', target: currentCaller, accepted: true }));
    targetId = currentCaller; // Store targetId for future communication
    hideCallRequest();
    status.textContent = 'Call accepted, connecting...';
    status.classList.add('bg-blue-100', 'text-blue-700');
    endCallButton.classList.remove('hidden');
    startCallButton.classList.add('hidden');
    currentCaller = null;
  });

  // Handle reject call
  rejectCallButton.addEventListener('click', () => {
    console.log('WebSocket: Call rejected by user');
    ws.send(JSON.stringify({ type: 'call-response', target: currentCaller, accepted: false }));
    hideCallRequest();
    status.textContent = 'Call rejected';
    status.classList.add('bg-red-100', 'text-red-700');
    currentCaller = null;
  });

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket: Received message:', data.type);
      if (data.type === 'id') {
        if (userIdSpan) {
          userIdSpan.textContent = data.id;
          status.textContent = 'Connected to server, ready to call';
          status.classList.add('bg-green-100', 'text-green-700');
        } else {
          console.error('WebSocket: userIdSpan not found');
          status.textContent = 'Error: Interface not fully loaded';
          status.classList.add('bg-red-100', 'text-red-700');
        }
      } else if (data.type === 'call-request') {
        console.log('WebSocket: Received call request from:', data.sender);
        currentCaller = data.sender;
        if (document.hasFocus()) {
          showCallRequest(data.sender);
        } else {
          console.log('WebSocket: Page not focused, prompting user to focus');
          status.textContent = 'Incoming call received, please focus this tab';
          status.classList.add('bg-yellow-100', 'text-yellow-700');
          setTimeout(() => {
            if (document.hasFocus()) {
              showCallRequest(data.sender);
            } else {
              console.log('WebSocket: Page still not focused, rejecting call');
              ws.send(JSON.stringify({ type: 'call-response', target: data.sender, accepted: false }));
              status.textContent = 'Call rejected: Please focus this tab';
              status.classList.add('bg-red-100', 'text-red-700');
              currentCaller = null;
            }
          }, 5000);
        }
      } else if (data.type === 'call-response') {
        console.log(`WebSocket: Call response from ${data.sender}: ${data.accepted}`);
        if (data.accepted) {
          targetId = data.sender; // Store targetId for initiator
          status.textContent = `Connected to user ${data.sender}`;
          status.classList.add('bg-green-100', 'text-green-700');
          console.log(`WebSocket: Connected to ${data.sender}`);
          endCallButton.classList.remove('hidden');
          startCallButton.classList.add('hidden');
        } else {
          status.textContent = 'Call rejected by remote user';
          status.classList.add('bg-red-100', 'text-red-700');
          console.log('WebSocket: Call rejected by remote user');
        }
      } else if (data.type === 'video') {
        remoteVideo.src = data.data;
      } else if (data.type === 'audio') {
        const audio = new AudioContext();
        const buffer = new Float32Array(data.data);
        const audioBuffer = audio.createBuffer(1, buffer.length, audio.sampleRate);
        audioBuffer.getChannelData(0).set(buffer);
        const source = audio.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audio.destination);
        source.start();
      } else if (data.type === 'camera-toggle') {
        if (data.enabled) {
          status.textContent = `Camera enabled by user ${data.sender}`;
          status.classList.add('bg-green-100', 'text-green-700');
        } else {
          remoteVideo.src = '';
          status.textContent = `Camera disabled by user ${data.sender}`;
          status.classList.add('bg-red-100', 'text-red-700');
        }
        showToast(`Camera ${data.enabled ? 'enabled' : 'disabled'} by user ${data.sender}`);
        console.log(`WebSocket: Camera ${data.enabled ? 'enabled' : 'disabled'} by ${data.sender}`);
      } else if (data.type === 'mic-toggle') {
        status.textContent = `Microphone ${data.enabled ? 'enabled' : 'disabled'} by user ${data.sender}`;
        status.classList.add(data.enabled ? 'bg-green-100' : 'bg-red-100', data.enabled ? 'text-green-700' : 'text-red-700');
        showToast(`Microphone ${data.enabled ? 'enabled' : 'disabled'} by user ${data.sender}`);
        console.log(`WebSocket: Microphone ${data.enabled ? 'enabled' : 'disabled'} by ${data.sender}`);
      } else if (data.type === 'error') {
        status.textContent = data.message;
        status.classList.add('bg-red-100', 'text-red-700');
        console.log('WebSocket: Error from server:', data.message);
      } else if (data.type === 'disconnected' || data.type === 'call-ended') {
        status.textContent = data.type === 'disconnected' ? 'The other user disconnected' : 'Call ended by remote user';
        status.classList.add('bg-red-100', 'text-red-700');
        remoteVideo.src = '';
        console.log(`WebSocket: ${data.type} from ${data.id || data.sender}`);
        endCall();
      }
    } catch (err) {
      console.error('WebSocket: Error processing message:', err);
      status.textContent = 'Error processing message';
      status.classList.add('bg-red-100', 'text-red-700');
    }
  };

  ws.onopen = () => {
    console.log('WebSocket: Connected to WebSocket server');
    status.textContent = 'Connected to server';
    status.classList.add('bg-green-100', 'text-green-700');
    startVideo();
  };

  ws.onclose = (event) => {
    console.log(`WebSocket: Disconnected from server, code: ${event.code}, reason: ${event.reason || 'none'}`);
    status.textContent = 'Disconnected from server';
    status.classList.add('bg-red-100', 'text-red-700');
    endCall();
  };

  ws.onerror = (err) => {
    console.error('WebSocket: Error:', err);
    status.textContent = 'Error connecting to server';
    status.classList.add('bg-red-100', 'text-red-700');
  };

  startCallButton.addEventListener('click', () => {
    console.log('WebSocket: Start call button clicked');
    connectToUser();
  });

  endCallButton.addEventListener('click', () => {
    console.log('WebSocket: End call button clicked');
    endCall();
  });
});