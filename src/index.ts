import { buildApp } from './app';

async function startApp() {
	try {
		const app = await buildApp();

		const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
		const host = process.env.HOST || '0.0.0.0';

		app.listen({ port, host });

		console.log(`Server is running at http://${host}:${port}`);
	} catch (error) {
		console.error('Error starting server:', error);
		process.exit(1);
	}
}

startApp();
