import Folders from "./folders.model.js";

const createFolderEntry = async (folderObj) => {
	let status;
	try {
		status = await new Folders(folderObj).save();
	} catch (error) {
		console.error(new Error("Couldn't insert folder entry"), { cause: error });
		return;
	}
	if (!status?._id) {
		console.warn("Couldn't insert folder entry", folderObj.name);
	}
	return status;
};

const readFolderEntries = async (searchCondition = {}) => {
	let output;
	try {
		output = await Folders.find(searchCondition);
	} catch (error) {
		console.error(new Error("Couldn't read folder entries"), { cause: error });
		return;
	}
	return output;
};

const renameFolderEntry = async (folderId, name) => {
	let status;
	try {
		status = await Folders.updateOne({ _id: folderId }, { name });
	} catch (error) {
		console.error(new Error("Couldn't rename folder entry"), { cause: error });
		return;
	}
	if (status.acknowledged && status.matchedCount === 0) {
		console.warn("Couldn't rename, no match found", folderId);
	}
};

const removeFolderEntry = async (folderId) => {
	let status;
	try {
		status = await Folders.deleteOne({ _id: folderId });
	} catch (error) {
		console.error(new Error("Couldn't remove folder entry"), { cause: error });
		return;
	}
	if (!(status.acknowledged && status.deletedCount === 1)) {
		console.warn("No folder entry was found for", folderId);
	}
};

// Single-item drag-and-drop move: updates this folder's manual order and,
// if it changed parents, its parentFolderId.
const moveFolderEntry = async ({ id, order, parentFolderId }) => {
	let status;
	try {
		status = await Folders.updateOne(
			{ _id: id },
			{ $set: { order, parentFolderId: parentFolderId ?? null } }
		);
	} catch (error) {
		console.error(new Error("Couldn't move folder entry"), { cause: error });
		return;
	}
	return status;
};

export {
	createFolderEntry,
	readFolderEntries,
	renameFolderEntry,
	removeFolderEntry,
	moveFolderEntry,
};
