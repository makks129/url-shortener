class AppError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
	}
}

export class ServerError extends AppError {
	constructor() {
		super('Internal Server Error', 500);
	}
}

export class NotFoundError extends AppError {
	constructor() {
		super('Not Found', 404);
	}
}
