import { socket } from "../../../lib/socket";
import type { FolderTreeNode, CreationContext } from "../components/TabTree";

interface CommandResponse {
	success: boolean;
	error?: string;
	data?: { id: string };
}

export function useFolderActions() {
	const createFolder = (context: CreationContext, name: string) => {
		socket.emit(
			"folder:create",
			{ name, windowId: context.windowId, parentFolderId: context.parentFolderId },
			(response: CommandResponse) => {
				if (!response?.success) {
					console.error("Failed to create folder", response?.error);
				}
			}
		);
	};

	const deleteFolder = (folder: FolderTreeNode) => {
		socket.emit(
			"folder:delete",
			{ id: folder.id },
			(response: CommandResponse) => {
				if (!response?.success) {
					console.error("Failed to delete folder", response?.error);
				}
			}
		);
	};

	return { createFolder, deleteFolder };
}
