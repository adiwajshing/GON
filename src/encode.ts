import tableDoublingBuffer from './table-doubling-buffer';
import { Config, TerminalTypes } from './types';

const BYTE_MAX = 1 << 8
const SHORT_MAX = 1 << 16
const INT_MAX = Number.MAX_SAFE_INTEGER

/**
 * using while(i < len) loops as it's the fastest
 */

export default ({
  terminals
}: Config, obj: any) => {
  const buff = tableDoublingBuffer(512)
  
  let i = 0
  let len = 0

  const push = buff.push
  const pushInt = (long, length: number) => {
    while(length > 0) {
      const byte = long & 0xff
      push(byte)
      long = (long - byte) / 256
      length --
    }
  }
  const pushToken = (obj) => {
    if(typeof obj === 'boolean') {
      push(
        obj ? 
        terminals[TerminalTypes.booleanTrue] : 
        terminals[TerminalTypes.booleanFalse]
      )
    } else if(obj === null) {
      push(terminals[TerminalTypes.null])
    } else if(typeof obj === 'string') {
      push(terminals[TerminalTypes.string])
      len = obj.length
      i = 0
      while(i < len) {
        push(obj.charCodeAt(i))
        i ++
      }
      push(0)
    } else if(typeof obj === 'number') {
      if(obj % 1 === 0) { // it is an integer
        if(-BYTE_MAX < obj && obj < BYTE_MAX) {
          push(terminals[TerminalTypes.byte])
          push(obj)
        } else if(-SHORT_MAX < obj && obj < SHORT_MAX) {
          push(terminals[TerminalTypes.short])
          pushInt(obj, 2)
        } else if(-INT_MAX <= obj && obj <= INT_MAX) {
          push(terminals[TerminalTypes.int])
          pushInt(obj, 4)
        } else {
          push(terminals[TerminalTypes.long])
          pushInt(obj, 8)
        }
      } else {
        push(terminals[TerminalTypes.double])
        const dataView = new DataView(new ArrayBuffer(8))
        dataView.setFloat64(0, obj)
        i = 0
        len = dataView.byteLength
        while(i < len) {
          push(dataView.buffer[i])
          i ++
        }
      }
    } else {
      throw new Error(`cannot push token of type: "${typeof obj}"`)
    }
  }
  const pushValue = (obj) => {
    if(typeof obj === 'object' && !!obj) {
      if(typeof obj.getTime === 'function') {
        push(terminals[TerminalTypes.date])
        pushInt(obj.getTime(), 8)
      } else if(Buffer.isBuffer(obj)) {
        push(terminals[TerminalTypes.buffer])
        len = obj.length
        i = 0
        while(i < len) {
          push(obj[i])
          i ++
        }
        push(0)
      } else if(Array.isArray(obj)) {
        push(terminals[TerminalTypes.arrayStart])

        const len = obj.length
        let i = 0
        while(i < len) {
          pushValue(obj[i])
          i ++
        }

        push(terminals[TerminalTypes.arrayEnd])
      } else {
        push(terminals[TerminalTypes.objectStart])

        const keys = Object.keys(obj)
        const len = keys.length
        let i = 0
        while(i < len) {
          if(typeof obj[keys[i]] !== 'undefined') {
            pushToken(keys[i])
            pushValue(obj[keys[i]])
          }
          i ++
        }

        push(terminals[TerminalTypes.objectEnd])
      }
    } else {
      pushToken(obj)
    }
  }
  pushValue(obj)

  return buff.getBuffer()
}
