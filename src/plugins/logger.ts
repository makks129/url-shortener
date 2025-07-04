export const logger = {
	level: process.env.LOG_LEVEL || 'debug',
	transport: {
		target: 'pino-pretty',
		options: {
			translateTime: 'HH:MM:ss Z',
			ignore: 'pid,hostname',
			colorize: true,
			singleLine: true,
			levelFirst: false,
		},
	},
};
