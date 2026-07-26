# Tab Manager

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

## Tech Stack

- **MongoDB** — database
- **Express** — backend framework
- **React** — frontend library
- **Node.js** — runtime
- **Browser Extension API** — tab capture and syncing

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

### Installation

```bash
# Clone the repo
git clone https://github.com/whitespacecowboy/Tab-Manager.git
cd Tab-Manager

# Install dependencies
npm install
```

### Running the App

```bash
# Start the backend
cd server
npm run dev

# Start the frontend
cd client
npm run dev
```

Then load the extension:
1. Go to `about:debugging#/runtime/this-firefox`
2. Click Load Temporary Add-on...
3. Just click on any file from Tab-Manager/extension/

## Status

🚧 This project is a work in progress, built as part of a MERN stack course.

## License

MIT
