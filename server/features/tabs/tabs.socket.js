import { createTabEntry, updateTabEntry, removeTabEntry } from './tabs.repository.js';
import { getTabsTree, sync, moveEntry } from './tabs.service.js'

export function registerTabHandlers(io, socket) {
	socket.on('tab:created', async (tabData, callback) => {
		try {
			await createTabEntry(tabData);
			callback?.({ success: true });
			io.emit('tree:updated');
		} catch (error) {
			console.error(new Error("Failed to create tab entry"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('tab:deleted', async ({ id }, callback) => {
		try {
			await removeTabEntry({ id });
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

	// --- Client-initiated commands, relayed to the extension ---
	socket.on('tab:requestFocus', async ({ id, windowId }, callback) => {
		try {
			io.emit('command:focus', { tabId: id, windowId });
			callback?.({ success: true });
		} catch (error) {
			console.error(new Error("Failed to relay focus command"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('tab:requestDelete', async ({ id }, callback) => {
		try {
			io.emit('command:delete', { tabId: id });
			callback?.({ success: true });
		} catch (error) {
			console.error(new Error("Failed to relay delete command"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('tab:requestCreate', async ({ url }, callback) => {
		try {
			io.emit('command:create', { url });
			callback?.({ success: true });
		} catch (error) {
			console.error(new Error("Failed to relay create command"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	// Drag-and-drop arrangement — works for both tabs and folders.
	socket.on('tree:move', async ({ id, kind, order, folderId, parentFolderId }, callback) => {
		try {
			await moveEntry({ id, kind, order, folderId, parentFolderId });
			callback?.({ success: true });
			io.emit('tree:updated');
		} catch (error) {
			console.error(new Error("Failed to move entry"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});
}
