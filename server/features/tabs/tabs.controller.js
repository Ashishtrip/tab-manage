import { sync, getTabsTree } from './tabs.service.js'

export const handleShowTree = async (_, res) => {
	const output = await getTabsTree()
	res.status(200).json(output);
};

export const handleGetAll = async (req, res) => {
	await sync(req.body)
	res.status(200).json({ message: 'Tabs synced successfully'});
};

