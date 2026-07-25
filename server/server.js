import http from 'http';
import app from './config/express.js';
import connectDB from './config/database.js';
import registerListener from './config/socket.js'

const PORT_SERVER = 3000;
const PORT_DB = 27017;

async function main() {
	try {
		await connectDB(PORT_DB);
		const server = http.createServer(app);
		registerListener(server)

		server.listen(PORT_SERVER, () => {
			console.info(`http://localhost:${PORT_SERVER}`);
		});
	} catch (error) {
		console.error(error);
	}
}

main();
