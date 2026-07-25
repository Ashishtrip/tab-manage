import { io } from "../lib/socket.io.js";
const PORT = 3000
const SERVER_URL = `http://localhost:${PORT}`
const socket = io(SERVER_URL);
export default socket;
