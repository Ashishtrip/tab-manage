import { getWindows, setWindowCategory } from "./windows.service.js"

export const registerWindowsHandlers = (io, socket) => {
	socket.on("windows:get", async (_, callback) => {
		try {
			const windows = await getWindows();
			callback({ success: true, data: windows });
		} catch (error) {
			callback({ success: false, error: error.message });
		}
	});

	socket.on("windows:setCategory", async ({ windowId, category }, callback) => {
		try {
			await setWindowCategory(windowId, category);
			// Broadcast the update to all clients
			const windows = await getWindows();
			io.emit("windows:updated", windows);
			if (callback) callback({ success: true });
		} catch (error) {
			if (callback) callback({ success: false, error: error.message });
		}
	});
}
