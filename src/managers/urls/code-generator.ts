/**
 * Generates a random alphanumeric code of the specified length
 */
export function generateRandomCode(length: number): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let code = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charactersLength);
		code += characters.charAt(randomIndex);
	}

	return code;
}
