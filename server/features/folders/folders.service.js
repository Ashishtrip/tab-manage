import Folders from "./folders.model.js";
import Tabs from "../tabs/tabs.model.js";
import { removeFolderEntry } from "./folders.repository.js";

// Deleting a folder shouldn't orphan or cascade-delete what's inside it —
// its direct children (sub-folders and tabs) move up to whatever the
// deleted folder's own parent was (or the window root, if it had none).
const deleteFolderAndReparentChildren = async (folderId) => {
	let folder;
	try {
		folder = await Folders.findById(folderId);
	} catch (error) {
		console.error(new Error("Couldn't look up folder before delete"), { cause: error });
		return;
	}
	if (!folder) return;

	try {
		await Folders.updateMany(
			{ parentFolderId: folderId },
			{ parentFolderId: folder.parentFolderId ?? null }
		);
		await Tabs.updateMany(
			{ folderId: folderId },
			{ folderId: folder.parentFolderId ?? null }
		);
	} catch (error) {
		console.error(new Error("Couldn't reparent folder contents"), { cause: error });
		return;
	}

	return removeFolderEntry(folderId);
};

export { deleteFolderAndReparentChildren };
