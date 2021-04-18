import { Config } from './types';

const BYTE_MAX = 1 << 8
const SHORT_MAX = 1 << 16
const INT_MAX = Number.MAX_SAFE_INTEGER

export default ({terminals}: Config, obj: any, encArr: number[] = []) => {
  const push = (byte: number) => encArr.push(byte)
  const pushInt = (long, length: number) => {
      for (let index = 0; index < length; index ++ ) {
          const byte = long & 0xff;
          push(byte)
          long = (long - byte) / 256 ;
      }
  }
  const pushToken = (obj) => {
    if(typeof obj === 'boolean') {
      push(
        terminals[obj ? 'booleanTrue' : 'booleanFalse']
      )
    } else if(obj === null) {
      push(terminals.null)
    } else if(typeof obj === 'string') {
      push(terminals.string)
      const len = obj.length
      for(let i = 0; i < len;i++) {
        push(obj.charCodeAt(i))
      }
      push(0)
    } else if(typeof obj === 'number') {
      if(obj % 1 === 0) { // it is an integer
        if(-BYTE_MAX < obj && obj < BYTE_MAX) {
          push(terminals.byte)
          push(obj)
        } else if(-SHORT_MAX < obj && obj <= SHORT_MAX) {
          push(terminals.short)
          pushInt(obj, 2)
        } else if(-INT_MAX >= obj && obj <= INT_MAX) {
          push(terminals.int)
          pushInt(obj, 4)
        } else {
          push(terminals.long)
          pushInt(obj, 8)
        }
      } else {
        push(terminals.double)
        const dataView = new DataView(new ArrayBuffer(8))
        dataView.setFloat64(0, obj)
        for(let i = 0; i < dataView.byteLength; i++) {
          push(dataView.buffer[i])
        }
      }
    } else {
      throw new Error(`cannot push token of type: "${typeof obj}"`)
    }
  }
  const pushValue = (obj) => {
    if(typeof obj === 'object' && !!obj) {
      if(typeof obj.getTime === 'function') {
        push(terminals.date)
        pushInt(obj.getTime(), 8)
      } else if(Buffer.isBuffer(obj)) {
        push(terminals.buffer)
        for(const item of obj) {
          push(item)
        }
        push(0)
      } else if(Array.isArray(obj)) {
        push(terminals.arrayStart)
        for(const value of obj) {
          pushValue(value)
        }
        push(terminals.arrayEnd)
      } else {
        push(terminals.objectStart)
        for(const key in obj) {
          if(typeof obj[key] !== 'undefined') {
            pushToken(key)
            pushValue(obj[key])
          }
        }
        push(terminals.objectEnd)
      }
    } else {
      pushToken(obj)
    }
  }
  pushValue(obj)
}
