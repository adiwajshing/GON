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
  } else if(obj === null) {
    push(config.terminals.null)
  }
}
