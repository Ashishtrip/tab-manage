# Bastion

A better way to organize your browser tabs.

## Description

Tab Manager is a MERN stack project that organizes your browser tabs into a **tree structure**, so you can visually map out how your tabs relate to each other and keep track of your line of thought instead of losing it in a wall of flat tabs.

Tabs can be linked as **parents, children, and siblings**, grouped into **folders**, and rearranged freely. You can also create **multiple workspaces**, each with its own independent tab tree — handy for separating projects, research threads, or contexts.

## How It Works

- **Frontend** — built with React (+ CSS), renders your tabs as an indented tree view (think the Linux `tree` command, not a node-graph canvas)
- **Backend** — Node.js + Express + MongoDB, stores your tab trees and workspaces
- **Browser Extension** — a companion extension that talks to the website, capturing your open tabs and syncing them into the tree

## Features

- 🌳 Tree-structured tab organization (parent/child/sibling relationships)
- 📁 Folders to group related tabs
- 🖱️ Drag-and-drop rearranging of the tree
- 🗂️ Multiple workspaces, each with its own tab tree
- 🔌 Browser extension for capturing and syncing tabs
- 🧠 **AI-Powered Semantic Clusters** — automatically groups related tabs by meaning using Google Gemini.
- 📱 **Device Handoff** — seamlessly send tabs between your active devices via WebSockets.
- 🗃️ **Smart Workspace** — unified dashboard with workspace stats and tab history.

## Tech Stack

- **MongoDB** — database (stores tabs, devices, clusters)
- **Express** — backend framework
- **React** — frontend library
- **Node.js** — runtime
- **Browser Extension API** — tab capture and syncing
- **Redis & BullMQ** — asynchronous background job queues for AI processing
- **Socket.io** — real-time WebSocket communication for device presence and handoff
- **Google Gemini API** — LLM used for text embeddings and topic clustering

## Project Structure

```
Tab-Manager/
├── client/      # React frontend
├── server/      # Express + MongoDB backend
├── extension/   # Browser extension
└── shared/      # Shared types between client and server
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB (local instance or a connection URI)
- Redis (local instance running on default port `6379`, e.g., via Docker or Homebrew)
- A Google Gemini API Key

### Configuration (Environment Variables)

Before running the server, copy or create a `.env` file in the `server` directory:

```bash
JWT_ACCESS_SECRET=your_jwt_access_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Installation

```bash
# Clone the repo
git clone https://github.com/whitespacecowboy/tab-manage.git
cd tab-manage
npm install

cd client
npm install

cd server
npm install 

cd ..

```

### Running the App

```
npm run dev # from your tab-manage directory
```

Then load the extension:
1. Go to `about:debugging#/runtime/this-firefox`
2. Click Load Temporary Add-on...
3. Just click on any file from Tab-Manager/extension/

## Status

🚧 This project is a work in progress, built as part of a MERN stack course.

## License

MIT
