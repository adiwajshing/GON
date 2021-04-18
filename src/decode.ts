import { Readable } from "stream";
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
const DECODE_MAP: { [T in Terminal]?: (array: DataView) => number | bigint } = {
	'byte': (value) => value.getUint8(0),
	'short': (value) => value.getInt16(0, true),
	'int': (value) => value.getInt32(0, true),
	'long': (value) => value.getBigInt64(0, true),
	'float': (value) => value.getFloat32(0, true),
	'double': (value) => value.getFloat64(0, true),
	'date': (value) => value.getBigInt64(0, true),
}

export default (
	{reverseMap, terminals}: FullInternalConfig, 
	stream: Readable | Buffer
) => {
	let finalValue: any

	const expectedTokenStack: StackItem[] = []
	let currentType: Terminal
	let currentBuffer: number[] | DataView
	let byteIdx = 0

	const onToken = (value) => {
		if(expectedTokenStack.length === 0) {
			if(typeof finalValue !== 'undefined') {
				throw new Error('recieved two tokens, not in array')
			}
			finalValue = value
		} else {
			const obj = expectedTokenStack[0]
			if(obj.type === 'arrayStart') {
				obj.value.push(value)
			} else {
				if(!obj.nextKey) {
					if(typeof value !== 'string') {
						throw new Error('Expected string key in object')
					}
					obj.nextKey = value 
				} else {
					obj.value[obj.nextKey] = value
					obj.nextKey = undefined
				}
			}
		}
		currentType = undefined
	}
	const onByte = (item: number) => {
		if(typeof currentType === 'undefined') {
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
					currentType = reverseMap[item]
					currentBuffer = new DataView(
						new ArrayBuffer(TOKEN_MAP[currentType])
					)
				break
				case terminals.string:
					byteIdx = 0
					currentBuffer = []
					currentType = 'string'
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
					expectedTokenStack.splice(0, 0, { type, value })
				break
				case terminals.arrayEnd:
				case terminals.objectEnd:
					const obj = expectedTokenStack[0]
					if(obj.type === 'arrayStart' && item !== terminals.arrayEnd) {
						throw new Error('Unexpected end of array found')
					}
					if(obj.type === 'objectStart' && item !== terminals.objectEnd) {
						throw new Error('Unexpected end of array found')
					}
					expectedTokenStack.splice(0, 1)
				break
				default:
					throw new Error(`Encountered unexpected byte "${item}"`)
			}
			return
		}

		if(TOKEN_MAP[currentType] && !Array.isArray(currentBuffer)) {
			currentBuffer.setUint8(byteIdx, item)
			byteIdx += 1
			
			if(byteIdx >= TOKEN_MAP[currentType]) {
				let item: any = DECODE_MAP[currentType](currentBuffer)
				if(currentType === 'date') {
					item = new Date(item)
				}
				onToken(item)
			}
		} else if(currentType === 'string' && Array.isArray(currentBuffer)) {
			if(item === 0) {
				const str = Buffer.from(currentBuffer as number[]).toString('ascii')
				onToken(str)
			} else currentBuffer.push(item)
		} else throw new Error(`unknown type running: "${currentType}"`)
	}
	const decodeChunk = (buffer: Buffer) => {
		for(const item of buffer) {
			onByte(item)
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