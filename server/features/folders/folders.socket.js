import { createFolderEntry, renameFolderEntry } from './folders.repository.js';
import { deleteFolderAndReparentChildren } from './folders.service.js';

export function registerFolderHandlers(io, socket) {
	socket.on('folder:create', async ({ name, windowId, parentFolderId }, callback) => {
		try {
			const folder = await createFolderEntry({
				name,
				windowId,
				parentFolderId: parentFolderId ?? null,
			});
			if (!folder) {
				callback?.({ success: false, error: "Couldn't create folder" });
				return;
			}
			callback?.({ success: true, data: { id: folder._id.toString() } });
			io.emit('tree:updated');
		} catch (error) {
			console.error(new Error("Failed to create folder"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('folder:rename', async ({ id, name }, callback) => {
		try {
			await renameFolderEntry(id, name);
			callback?.({ success: true });
			io.emit('tree:updated');
		} catch (error) {
			console.error(new Error("Failed to rename folder"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});

	socket.on('folder:delete', async ({ id }, callback) => {
		try {
			await deleteFolderAndReparentChildren(id);
			callback?.({ success: true });
			io.emit('tree:updated');
		} catch (error) {
			console.error(new Error("Failed to delete folder"), { cause: error });
			callback?.({ success: false, error: error.message });
		}
	});
}
