import { readWindows, upsertWindow } from "./windows.repository.js"

export const getWindows = async () => {
	const windows = await readWindows({});
	if (!windows) return {};
	
	// Map windowId to category string
	return windows.reduce((acc, win) => {
		acc[win.windowId] = win.category;
		return acc;
	}, {});
}

export const setWindowCategory = async (windowId, category) => {
	return await upsertWindow(windowId, category);
}
