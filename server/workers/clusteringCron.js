import cron from 'node-cron';
import Tabs from '../features/tabs/tabs.model.js';
import Cluster from '../features/clusters/clusters.model.js';
import User from '../features/users/users.model.js';
import { GoogleGenAI } from '@google/genai';
import connectDB from '../config/database.js';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateClusters(tabs) {
	if (tabs.length === 0) return [];

	const tabsData = tabs.map(t => `- ID: ${t._id}, Title: ${t.title}, URL: ${t.url}, Summary: ${t.contentSummary || 'N/A'}`).join('\n');
	
	const prompt = `
	Analyze the following list of web browser tabs and group them into logical, semantic topics/clusters based on their content, title, and URL.
	Return the output ONLY as a valid JSON array of objects.
	Do not include markdown blocks or any other text.
	
	Format:
	[
		{
			"title": "Topic Name (e.g., 'React Development', 'News', 'Shopping')",
			"tabIds": ["<tab_id_1>", "<tab_id_2>"]
		}
	]
	
	Tabs:
	${tabsData}
	`;

	try {
		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: prompt,
			config: {
				responseMimeType: "application/json",
			}
		});

		const clusters = JSON.parse(response.text);
		return clusters;
	} catch (error) {
		console.error("Error generating clusters with Gemini:", error);
		return [];
	}
}

// Connect to DB for standalone run
connectDB(27017);

async function runClustering() {
	console.log("Starting periodic clustering job...");
	try {
		// Run for all users (in a real app, this would be optimized)
		const users = await User.find({});
		
		for (const user of users) {
			const activeTabs = await Tabs.find({ 
				// In a full implementation, you'd link Tabs to Users (or via Windows -> Users).
				// For this prototype, we'll just grab all active tabs and assume they belong to the user if no strict user-tab relation exists.
				// Assuming Tabs have a 'status' or aren't archived.
				isArchived: { $ne: true } 
			});

			if (activeTabs.length > 0) {
				const generatedClusters = await generateClusters(activeTabs);
				
				// Overwrite old clusters for this user
				await Cluster.deleteMany({ userId: user._id });
				
				const clustersToSave = generatedClusters.map(c => ({
					userId: user._id,
					title: c.title,
					tabIds: c.tabIds
				}));

				await Cluster.insertMany(clustersToSave);
				console.log(`Saved ${clustersToSave.length} clusters for user ${user._id}`);
			}
		}
		
	} catch (error) {
		console.error("Clustering job failed:", error);
	}
	console.log("Finished clustering job.");
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', runClustering);

console.log("Clustering cron job scheduled (runs every 5 minutes)");

// Export for manual triggering
export { runClustering };
