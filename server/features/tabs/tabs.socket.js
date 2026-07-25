import { createTabEntry, updateTabEntry, deleteTabEntry} from './tabs.repository.js';
import { getTabsTree, sync } from './tabs.service.js'

export function registerTabHandlers(io, socket) {
	socket.on('tab:created', async (tabData, callback) => {
		try {
			await createTabEntry(tabData);
			callback?.({ success: true });
			io.emit('tree:updated'); // notify all connected clients
		} catch (error) {
			console.error(new Error("Failed to create tab entry"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('tab:deleted', async ({ id }, callback) => {
		try {
			await deleteTabEntry({ id });
			callback?.({ success: true });
			io.emit('tree:updated');
		} catch (error) {
			console.error(new Error("Failed to remove tab entry"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('tab:updated', async ({ id, changeInfo }, callback) => {
		try {
			await updateTabEntry({ id, changeInfo });
			callback?.({ success: true });
			io.emit('tree:updated');
		} catch (error) {
			console.error(new Error("Failed to update tab entry"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('tree:get', async (_, callback) => {
		try {
			const tree = await getTabsTree();
			callback?.({ success: true, data: tree });
		} catch (error) {
			console.error(new Error("Failed to construct tab tree"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('tabs:sync', async (payload, callback) => {
		try {
			await sync(payload);
			callback?.({ success: true });
			io.emit('tree:updated');
		} catch (error) {
			console.error(new Error("Failed to sync tabs"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});
}
