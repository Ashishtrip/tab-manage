import { getTabsTree, sync } from './tabs.service.js'
import Tabs from './tabs.model.js';
import Windows from '../windows/windows.model.js';
import Cluster from '../clusters/clusters.model.js';

export const handleShowTree = async (_, res) => {
	const output = await getTabsTree()
	res.status(200).json(output);
};

export const handleGetAll = async (req, res) => {
	await sync(req.body)
	res.status(200).json({ message: 'Tabs synced successfully'});
};

export const handleGetStats = async (req, res) => {
	try {
		const activeTabsCount = await Tabs.countDocuments({ isArchived: { $ne: true } });
		const archivedTabsCount = await Tabs.countDocuments({ isArchived: true });
		const windowsCount = await Windows.countDocuments({});
		// In a real app we filter by userId
		const clustersCount = await Cluster.countDocuments({});

		res.status(200).json({
			activeTabs: activeTabsCount,
			archivedTabs: archivedTabsCount,
			windows: windowsCount,
			clusters: clustersCount
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
