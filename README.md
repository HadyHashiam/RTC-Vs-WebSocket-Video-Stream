# Video Call Application with WebSocket and WebRTC

![Video Call Demo]
*A real-time video and audio call application using WebSocket and WebRTC technologies.*

## Overview

This project is a real-time communication application that allows users to make video and audio calls using two different methods: **WebSocket** for server-relayed streaming and **WebRTC** for peer-to-peer connections. Built with Node.js, Express, and Socket.IO, it features a modular backend and a simple, user-friendly frontend. Users can toggle their camera and microphone, initiate/accept calls, and receive real-time status updates.

This project is ideal for developers looking to explore real-time communication, WebSocket, and WebRTC.

### 🎯 What Makes This Project Unique?

This isn't just another video calling application—it's a **technical laboratory** where developers can explore, benchmark, and understand the fundamental differences between modern real-time communication technologies. The platform serves as both an educational resource and a practical testing ground for making informed architectural decisions.

### 🎯 What Makes This Project Unique?

This isn't just another video calling application—it's a **technical laboratory** where developers can explore, benchmark, and understand the fundamental differences between modern real-time communication technologies. The platform serves as both an educational resource and a practical testing ground for making informed architectural decisions.

### 🔬 Dual Implementation Architecture

The project features **parallel implementations** of the same video calling functionality using two distinct approaches:

**🌐 WebRTC Implementation**
- **Direct Peer-to-Peer** connections with minimal server involvement
- **Optimal Performance** with native browser APIs for media streaming  
- **Advanced Signaling** through Socket.IO for connection establishment
- **ICE Negotiation** for NAT traversal and optimal routing
- **Low Latency** communication ideal for real-time interactions

**🔌 WebSocket Implementation**  
- **Server-Mediated** streaming with full control over data flow
- **Custom Protocol** for video frames (JPEG) and audio (PCM) transmission
- **Centralized Management** of all client connections and states
- **Flexible Routing** enabling features like recording, moderation, and broadcasting
- **Scalable Architecture** suitable for multi-user scenarios

### 🚀 Real-World Learning Laboratory

This platform bridges the gap between theoretical knowledge and practical implementation, offering developers hands-on experience with:
- **Performance Benchmarking** - Real-time metrics comparison
- **Architecture Decision Making** - Understanding when to use each approach
- **Implementation Patterns** - Clean, modular code structure for both technologies
- **Error Handling Strategies** - Robust network failure management
- **Scalability Considerations** - Resource usage and connection management

## ✨ Key Features

### 🎥 Video Streaming Capabilities
- **Real-time Video Calls** - High-quality peer-to-peer and server-mediated video communication
- **Audio Streaming** - Crystal clear audio transmission with both technologies
- **Camera Controls** - Toggle camera on/off during calls
- **Microphone Controls** - Mute/unmute functionality
- **Call Management** - Initiate, accept, reject, and end calls

### 📊 Performance Analysis
- **Bandwidth Monitoring** - Real-time bandwidth usage comparison
- **Latency Measurement** - End-to-end latency analysis
- **Quality Metrics** - Video quality assessment and comparison
- **Connection Stability** - Network resilience testing

### 🔧 Technical Implementation
- **Dual Server Architecture** - Separate servers for Socket.IO and WebSocket
- **Modular Design** - Clean separation of concerns for easy maintenance
- **Error Handling** - Comprehensive error management and recovery
- **Scalable Architecture** - Built for performance and scalability testing

## 🏗️ Architecture

### Server Components
- **🌐 Express Server** - Main web server hosting the application
- **📡 Socket.IO Server** - WebRTC signaling and real-time communication
- **🔌 WebSocket Server** - Raw WebSocket video streaming implementation
- **⚡ Dual-Port Setup** - Separate ports for different technologies

### Communication Flow

#### WebRTC Flow (via Socket.IO)
1. **Peer Discovery** - Clients connect and receive unique peer IDs
2. **Signaling** - SDP offer/answer exchange through Socket.IO
3. **ICE Negotiation** - Candidate exchange for NAT traversal
4. **Direct P2P Connection** - Media streams directly between peers
5. **Call Management** - Real-time call state management

#### WebSocket Flow
1. **Client Connection** - Direct WebSocket connection with UUID assignment
2. **Call Initiation** - Server-mediated call request/response
3. **Media Streaming** - Video/audio data streamed through server
4. **State Synchronization** - Server maintains call state and client connections

## Tech Stack
## 🛠️ Technology Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for HTTP server
- **Socket.IO** - Real-time bidirectional event-based communication
- **WebSocket (ws)** - Raw WebSocket implementation for direct communication

### WebRTC Libraries
- **Simple-Peer** - WebRTC wrapper for simplified peer-to-peer connections
- **MediaSoup** - Cutting-edge WebRTC media server for advanced use cases
- **MediaSoup-Client** - Client-side library for MediaSoup integration

### Utilities
- **UUID** - Unique identifier generation for client tracking

## 📦 Installation & Setup

### Prerequisites
- **Node.js** >= 14.x
- **npm** or **yarn** package manager
- **Modern Browser** with WebRTC support

###Frontend**:
  - HTML5, CSS3, JavaScript
  - WebRTC (peer-to-peer streaming)
  - WebSocket (server-relayed streaming)
  - Font Awesome (icons)
###Development**:
  - Nodemon (auto-reload in development)
  - Git (version control)
## 🚀 API Documentation

### Socket.IO Events (Port 3000)

#### Client → Server Events
| Event | Payload | Description |
|-------|---------|-------------|
| `call-request` | `{ target: string }` | Initiate call to target peer |
| `call-response` | `{ target: string, accepted: boolean }` | Respond to incoming call |
| `offer` | `{ target: string, signal: RTCSessionDescription }` | Send WebRTC offer |
| `answer` | `{ target: string, signal: RTCSessionDescription }` | Send WebRTC answer |
| `ice-candidate` | `{ target: string, candidate: RTCIceCandidate }` | Exchange ICE candidates |
| `end-call` | `{ target: string }` | End active call |

#### Server → Client Events
| Event | Payload | Description |
|-------|---------|-------------|
| `peer-id` | `string` | Unique peer identifier |
| `call-request` | `{ sender: string }` | Incoming call notification |
| `call-response` | `{ sender: string, accepted: boolean }` | Call response from peer |
| `offer` | `{ signal: RTCSessionDescription, sender: string }` | WebRTC offer from peer |
| `answer` | `{ signal: RTCSessionDescription, sender: string }` | WebRTC answer from peer |
| `ice-candidate` | `{ candidate: RTCIceCandidate, sender: string }` | ICE candidate from peer |
| `call-ended` | `{ sender: string }` | Call ended notification |
| `user-disconnected` | `string` | Peer disconnection notification |

### WebSocket Messages (Port 3001)

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
