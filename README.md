# Video Call Application with WebSocket and WebRTC

![Video Call Demo]
*A real-time video and audio call application using WebSocket and WebRTC technologies.*

## Overview

This project is a real-time communication application that allows users to make video and audio calls using two different methods: **WebSocket** for server-relayed streaming and **WebRTC** for peer-to-peer connections. Built with Node.js, Express, and Socket.IO, it features a modular backend and a simple, user-friendly frontend. Users can toggle their camera and microphone, initiate/accept calls, and receive real-time status updates.

This project is ideal for developers looking to explore real-time communication, WebSocket, and WebRTC.

## Features

- **Dual Call Modes**:
  - **WebSocket**: Streams video as JPEG frames and audio as raw PCM data via a server.
  - **WebRTC**: Enables direct peer-to-peer video and audio calls with Socket.IO signaling.
- **Media Controls**: Toggle camera and microphone with real-time notifications to the other user.
- **Call Management**: Initiate, accept, reject, or end calls using unique user IDs.
- **User Interface**: Simple HTML interface with toast notifications and status updates.
- **Modular Backend**: Organized into separate modules for scalability and easy maintenance.
- **Error Handling**: Handles network issues, invalid inputs, and large messages.
- **Browser Support**: Compatible with modern browsers (Chrome, Firefox, etc.).

## Tech Stack

- **Backend**:
  - Node.js
  - Express.js (serves static files)
  - Socket.IO (WebRTC signaling)
  - ws (WebSocket for video/audio streaming)
  - uuid (unique user IDs)
- **Frontend**:
  - HTML5, CSS3, JavaScript
  - WebRTC (peer-to-peer streaming)
  - WebSocket (server-relayed streaming)
  - Font Awesome (icons)
- **Development**:
  - Nodemon (auto-reload in development)
  - Git (version control)

## Project Structure

```
video-call-app/
├── public/
│   ├── index.html         # Main HTML interface
│   ├── client-rtc.js      # WebRTC client logic
│   ├── client-ws.js       # WebSocket client logic
│   ├── styles.css         # Basic styling
├── src/
│   ├── server.js          # Main server entry point
│   ├── expressConfig.js   # Express configuration
│   ├── socketIOConfig.js  # Socket.IO configuration
│   ├── webSocketConfig.js # WebSocket configuration
│   ├── utils.js           # Utility functions
├── package.json           # Dependencies and scripts
├── README.md              # This file
```

## Prerequisites

- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, or equivalent)
- Basic knowledge of JavaScript and real-time communication

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/video-call-app.git
   cd video-call-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   nodemon src/server.js
   ```

4. **Access the Application**:
   - Open `http://localhost:3000` in two browser tabs.
   - Test WebSocket or WebRTC calls by sharing user IDs.

## Usage

1. **Starting a Call**:
   - Copy your user ID from the WebSocket or WebRTC section.
   - Paste the target user's ID in the input field and click "Start Call".
   - The other user will see a call request and can accept or reject it.

2. **Controlling Media**:
   - Use "Toggle Cam" to enable/disable the camera.
   - Use "Toggle Mic" to enable/disable the microphone.
   - The other user is notified of these changes in real-time.

3. **Ending a Call**:
   - Click "End Call" to stop the call and reset the interface.

## How It Works

- **WebSocket Mode**:
  - Video is captured as JPEG frames and sent to the server via WebSocket.
  - Audio is captured as raw PCM data using `AudioContext` and relayed through the server.
  - Camera and microphone status changes are synchronized using `camera-toggle` and `mic-toggle` messages.

- **WebRTC Mode**:
  - Socket.IO handles signaling for SDP offers/answers and ICE candidates.
  - Video and audio are streamed directly between users via `RTCPeerConnection`.
  - Supports call initiation, acceptance, and termination.



## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

Please follow the project's coding standards and include tests where applicable.

## Future Improvements

- Add Opus audio encoding for better audio quality.
- Implement user authentication for secure calls.
- Support group calls with multiple users.
- Optimize video compression for lower bandwidth usage.
- Add call recording functionality.
- Enhance mobile responsiveness.


## Acknowledgments

- Thanks to the open-source community for libraries like Socket.IO, ws, and uuid.
- Inspired by WebRTC and WebSocket tutorials and documentation.
