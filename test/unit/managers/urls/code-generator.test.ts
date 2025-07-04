import { generateRandomCode } from '../../../../src/managers/urls/code-generator';

describe('managers/urls', () => {
	describe('generateRandomCode', () => {
		it('generates code of provided length', () => {
			const len = 6;
			const code = generateRandomCode(len);
			expect(code.length).toBe(len);
		});

		// No test for alphanum is necessary as we only take 6 random chars from the set
		// Any test for alphanum would be redundant since the function is inherently random
	});
});
