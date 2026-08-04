import { Worker } from 'bullmq';
import { redisConnection } from '../config/queue.js';
import Tabs from '../features/tabs/tabs.model.js';
import { GoogleGenAI } from '@google/genai';
import connectDB from '../config/database.js';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateEmbedding(text) {
	try {
		const response = await ai.models.embedContent({
			model: 'text-embedding-004',
			contents: text,
		});
		return response.embeddings[0].values;
	} catch (error) {
		console.error("Error generating embedding with Gemini:", error);
		throw error;
	}
}

async function generateSummary(text) {
	try {
		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: `Summarize the following text in one short sentence: ${text}`
		});
		return response.text;
	} catch (error) {
		console.error("Error generating summary with Gemini:", error);
		return "";
	}
}

// Ensure DB connection for standalone worker process
connectDB(27017);

const tabWorker = new Worker('process_tab', async job => {
	if (job.name === 'embed_tab') {
		const { tabData } = job.data;
		
		try {
			// In a real app, we might scrape the page content here based on tabData.url.
			// For now, we will use the title and URL as the text to embed.
			const textToEmbed = `${tabData.title} ${tabData.url}`;
			
			const embedding = await generateEmbedding(textToEmbed);
			const summary = await generateSummary(textToEmbed);

			await Tabs.findByIdAndUpdate(tabData._id, {
				embedding: embedding,
				contentSummary: summary
			});

			console.log(`Successfully processed tab ${tabData._id}`);
		} catch (error) {
			console.error(`Failed to process tab ${tabData._id}:`, error);
			throw error;
		}
	}
}, { connection: redisConnection });

tabWorker.on('completed', job => {
	console.log(`Job ${job.id} has completed!`);
});

tabWorker.on('failed', (job, err) => {
	console.error(`Job ${job.id} has failed with ${err.message}`);
});

console.log("Tab Processor worker started");
