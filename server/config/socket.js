import { Server } from "socket.io";
import { registerTabHandlers } from "../features/tabs/tabs.socket.js";

export default function initializeSocket(server) {
	const io = new Server(server, {
		cors: { origin: "*" }
	});

	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		registerTabHandlers(io, socket);

		socket.on("disconnect", () => {
			console.log("Client disconnected:", socket.id);
		});
	});
}
