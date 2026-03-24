# 🎮 Webcam Game

> A real-time multiplayer game where **your face is your avatar**. Players' webcam feeds are captured and broadcast live during gameplay — because seeing your opponent panic in real-time is half the fun.

🌐 **[Play Now → webcamgame.kanapka.eu](https://webcamgame.kanapka.eu)**

---

## What is this?

Webcam Game is a browser-based multiplayer experience that streams every player's camera feed to all other participants during the match. No avatars, no usernames — just your actual face, live.

The first game mode is **Soccer**, where players compete on a virtual stadium while their webcam feeds are overlaid on the field.

**Try it instantly:**

```
https://webcamgame.kanapka.eu
```

---

## Tech Stack

| Layer                   | Technology             |
| ----------------------- | ---------------------- |
| Backend                 | Node.js + Express      |
| Real-time communication | WebSocket (`ws`)       |
| Frontend                | Vanilla JavaScript     |
| Bundler                 | Webpack                |
| Database                | MongoDB (via Mongoose) |
| Auth                    | SSO or JWT + bcrypt    |

---

## Project Structure

```
webcam-game/
├── client/          # Frontend JavaScript source
├── dist/            # Webpack build output (served to browser)
├── classes/         # Shared game logic classes
├── controllers/     # Express route controllers
├── routes/          # API route definitions
├── models/          # Mongoose data models
├── maps/            # Game map definitions
├── state/           # Server-side game state management
├── utils/           # Helper utilities
├── server.js        # Express app entry point
├── websocket.js     # WebSocket server logic
├── build.js         # Custom build script
└── webpack.config.js
```

---

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/) instance (local or Atlas)

### Setup

```bash
# Clone the repo
git clone https://github.com/szutciek/webcam-game.git
cd webcam-game

# Install dependencies
npm install

# Build the frontend bundle
npm run build

# Start the server
npm start
```

The server will start with `nodemon`, so it automatically restarts on file changes during development.

### Joining a Game

Once running, open your browser and navigate to:

```
http://localhost:<PORT>?room=random&map=stadium
```

> Your browser will ask for webcam permission — this is required to play.

---

## Game Modes

| Mode             | Map Parameter | Status            |
| ---------------- | ------------- | ----------------- |
| Soccer           | `map=stadium` | ✅ Available      |
| Among Us         | `map=ship`    | 🚧 In development |
| More coming soon | —             | 🚧 In development |
