import GON from ".."
import TEST_VECTORS from './test_vectors.json'

describe('Encoder', () => {
  it('Should encode single terminals', () => {

    for(const { input, output } of TEST_VECTORS) {
      const encoded = GON.encode(output)
      let buffer: Buffer
			if(typeof input === 'string') {
				buffer = Buffer.from(input.replace(/[\s\-]/g, ''), 'hex')
			} else {
				buffer = Buffer.from(input)
			}
      expect(encoded).toEqual(buffer)
    }
  })
})
