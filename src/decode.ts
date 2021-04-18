import { Readable } from "stream";
import tableDoublingBuffer, { TableDoublingBuffer } from "./table-doubling-buffer";
import { FullInternalConfig, Terminals } from "./types";

type Terminal = keyof Terminals
type StackItem = {
	type: 'objectStart'
	value: { [_: string]: any }
	nextKey?: string
} | {
	type: 'arrayStart'
	value: any[]
}
type Item = {
	type: 'string'
	value: string
} | {
	type: 'buffer'
	value: TableDoublingBuffer
} | {
	type: 'date' | 'double' | 'long' | 'int' | 'float' | 'short' | 'byte'
	value: DataView
}
const CONTAINER_MAP = {
	'objectStart': () => ({ }),
	'arrayStart': () => []
}

const TOKEN_MAP = {
	'date': 8,
	'double': 8,
	'long': 8,
	'int': 4,
	'float': 4,
	'short': 2,
	'byte': 1,
}
const DECODE_MAP: { [T in Terminal]?: (array: DataView) => number | bigint | Date } = {
	'byte': (value) => value.getUint8(0),
	'short': (value) => value.getInt16(0, true),
	'int': (value) => value.getInt32(0, true),
	'long': (value) => value.getBigInt64(0, true),
	'float': (value) => value.getFloat32(0, true),
	'double': (value) => value.getFloat64(0, true),
	'date': (value) => new Date(
		Number(value.getBigInt64(0, true))
	),
}

export default (
	{reverseMap, terminals}: FullInternalConfig, 
	stream: Readable | Buffer
) => {
	let finalValue: any
	// reused items
	const defaultBuffer = tableDoublingBuffer(256)
	const defaultDataView = {
		view: new DataView(
			new ArrayBuffer(8)
		),
		len: 0
	}
	let defaultString = ''
	let byteIdx = 0

	const expectedTokenStack: StackItem[] = []
	let current: Terminal
	
	let i = 0
	let len = 0

	const onToken = (value) => {
		if(expectedTokenStack.length === 0) {
			if(typeof finalValue !== 'undefined') {
				throw new Error('recieved two tokens, not in array')
			}
			finalValue = value
		} else {
			const obj = expectedTokenStack[expectedTokenStack.length-1]
			if(obj.type === 'arrayStart') {
				obj.value.push(value)
			} else {
				if(!obj.nextKey) {
					if(typeof value !== 'string') {
						throw new Error(`Expected string key in object, but got: "${typeof value}"`)
					}
					obj.nextKey = value 
				} else {
					obj.value[obj.nextKey] = value
					obj.nextKey = undefined
				}
			}
		}
		current = undefined
	}
	const onByte = function(item: number) {
		if(!current) {
			switch(item) {
				case terminals.booleanTrue:
				case terminals.booleanFalse:
					onToken(item === terminals.booleanTrue)
				break
				case terminals.null:
					onToken(null)
				break
				case terminals.byte:
				case terminals.short:
				case terminals.int:
				case terminals.long:
				case terminals.float:
				case terminals.double:
				case terminals.date:
					byteIdx = 0
					current = reverseMap[item]
					defaultDataView.len = TOKEN_MAP[current]
				break
				case terminals.string:
					byteIdx = 0
					current = 'string'
					defaultString = ''
				break
				case terminals.buffer:
					byteIdx = 0
					current = 'buffer'
					defaultBuffer.reset()
				break
				case terminals.objectStart:
				case terminals.arrayStart:
					const type = reverseMap[item]
					const value = CONTAINER_MAP[type]()
					if(!expectedTokenStack.length) {
						finalValue = value
					} else {
						onToken(value)
					}
					//@ts-ignore
					expectedTokenStack.push({ type, value })
				break
				case terminals.arrayEnd:
				case terminals.objectEnd:
					const obj = expectedTokenStack[expectedTokenStack.length-1]
					if(obj.type === 'arrayStart' && item !== terminals.arrayEnd) {
						throw new Error('Unexpected end of array found')
					}
					if(obj.type === 'objectStart' && item !== terminals.objectEnd) {
						throw new Error('Unexpected end of array found')
					}
					expectedTokenStack.pop()
				break
				default:
					throw new Error(`Encountered unexpected byte "${item}"`)
			}
			return
		}
		switch(current) {
			case 'string':
				if(item === 0) onToken(defaultString) 
				else defaultString += String.fromCharCode(item)
			break
			case 'buffer':
				if(item === 0) onToken(defaultBuffer.getBuffer()) 
				else defaultBuffer.push(item)
			break
			default:
				defaultDataView.view.setUint8(byteIdx, item)
				byteIdx += 1
				
				if(byteIdx >= defaultDataView.len) {
					onToken(
						DECODE_MAP[current](defaultDataView.view)
					)
				}
			break
		}
	}
	const decodeChunk = (buffer: Buffer) => {
		i = 0
		len = buffer.length
		while(i < len) {
			onByte(buffer[i])
			i++
		}
	}
	if(Buffer.isBuffer(stream)) {
		decodeChunk(stream)
	} else {
		return (async () => {
			for await(const chunk of stream) {
				decodeChunk(chunk)
			}
			return finalValue
		})()
	}
	return finalValue
}