import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisOptions = {
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: process.env.REDIS_PORT || 6379,
	maxRetriesPerRequest: null // Required by BullMQ
};

// Create a shared Redis connection
export const redisConnection = new Redis(redisOptions);

redisConnection.on('error', (err) => {
	console.error('Redis connection error:', err);
});

// Define queues
export const tabQueue = new Queue('process_tab', { connection: redisConnection });

export async function addTabToQueue(tabData) {
	await tabQueue.add('embed_tab', { tabData });
}
