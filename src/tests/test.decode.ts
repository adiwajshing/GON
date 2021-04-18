import TEST_VECTORS from './test_vectors.json'
import GONSerializer from '../'

describe('Decoding Tests', () => {

	it('should decode', () => {
		for(const { input, output } of TEST_VECTORS) {
			let buffer: Buffer
			if(typeof input === 'string') {
				buffer = Buffer.from(input.replace(/[\s\-]/g, ''), 'hex')
			} else {
				buffer = Buffer.from(input)
			}
			const value = GONSerializer.decode(buffer)
			expect(value).toStrictEqual(output)
		}
	})
})