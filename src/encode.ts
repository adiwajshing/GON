import { Config } from './types';

export default (config: Config, obj: any, encArr: number[] = []) => {
  function push(...bytes: number[]) {
    encArr.push(...bytes)
  }
  
  if(typeof obj === 'boolean') {
    push(
      config.terminals[obj ? 'booleanTrue' : 'booleanFalse']
    )
  } else if(typeof obj === 'string') {
    const arr = Array.from(Buffer.from(obj, 'ascii'))
    push(config.terminals.string)
    push(...arr)
    push(0)
  } else if (typeof obj == 'number') {
    // Check if number can be converted to IEEE754 without precision-loss
    if (Number.isSafeInteger(obj)) {
      if (obj < 0) {
        if (obj >= -0x7F) { // int8
          // dataview
        } else if (obj >= -0x7FFF) { // int16
          // dataview
        } else if (obj >= -0x7FFFFFFF) { // int32
          // dataview
        } else { // int64
          // dataview
        }
      } else {
        if (obj <= 0xFF) { // uint8
          // dataview
        } else if (obj <= 0xFFFF) { // uint16
          // dataview
        } else if (obj <= 0xFFFFFFFF) { // uint32
          // dataview
        } else { // uint64
          // dataview
        }
      }
    } else { // float
      // dataview
    }
    // TODO: handle larger numbers
  } else if(obj === null) {
    push(config.terminals.null)
  }
}
