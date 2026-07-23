import { createTabEntry, updateTabEntry, removeTabEntry } from "./tabs.repository.js"
import { constructTree, sync } from './tabs.service.js'

export const handleTabCreated = async (req, res) => {
	await createTabEntry(req.body)
	res.status(200).json({ message: 'Tab created event received' });
};

export const handleTabRemoved = async (req, res) => {
	const { id } = req.params;
	await removeTabEntry({ id });
	res.status(200).json({ message: 'Tab removed successfully' });
};

export const handleTabUpdated = async (req, res) => {
	await updateTabEntry(req.body)
	res.status(200).json({ message: 'Tab updated event received' });
};

export const handleShowTree = async (_, res) => {
	const output = await constructTree()
	res.status(200).json(output);
};

export const handleGetAll = async (req, res) => {
	await sync(req.body)
	res.status(200).json({ message: 'Tabs synced successfully'});
};
