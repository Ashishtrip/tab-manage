import { Server } from "socket.io";
import { registerTabHandlers } from "../features/tabs/tabs.socket.js";
import { registerFolderHandlers } from "../features/folders/folders.socket.js";
import { registerWindowsHandlers } from "../features/windows/windows.socket.js";

export default function initializeSocket(server) {
	const io = new Server(server, {
		cors: { origin: "*" }
	});

	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		registerTabHandlers(io, socket);
		registerFolderHandlers(io, socket);
		registerWindowsHandlers(io, socket);

		socket.on("disconnect", () => {
			console.log("Client disconnected:", socket.id);
		});
	});
}
