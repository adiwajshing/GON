import GON from "..";
import DefaultConfig from '../default-config'

let parser

beforeAll(() => {
  parser = GON(DefaultConfig)
})

describe('Encoder', () => {
  it('Should encode single terminals', () => {
    const TEST_VECTORS = [
      { input: null, output: DefaultConfig.terminals.null },
      { input: true, output: DefaultConfig.terminals.booleanTrue },
      { input: false, output: DefaultConfig.terminals.booleanFalse },
    ]
    for(const { input, output } of TEST_VECTORS) {
      const actual = parser.encode(input)
      //const path = __dirname + '/../../build/'
      //fs.writeFileSync(path + "null_test.bin", actual, 'binary')
      
      expect(actual).toEqual(Buffer.from([ output ]))
    }
  })
})
