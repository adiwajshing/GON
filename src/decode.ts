import { Readable } from "stream";
import tableDoublingBuffer from "./table-doubling-buffer";
import { FullInternalConfig, Terminals, TerminalTypes } from "./types";

type Terminal = keyof Terminals
type StackItem = {
	type: TerminalTypes.objectStart
	value: { [_: string]: any }
	nextKey?: string
} | {
	type: TerminalTypes.arrayStart
	value: any[]
}
const CONTAINER_MAP = {
	[TerminalTypes.objectStart]: () => ({ }),
	[TerminalTypes.arrayStart]: () => []
}

const TOKEN_MAP = {
	[TerminalTypes.long]: 8,
	[TerminalTypes.double]: 8,
	[TerminalTypes.date]: 8,
	[TerminalTypes.int]: 4,
	[TerminalTypes.float]: 4,
	[TerminalTypes.short]: 2,
	[TerminalTypes.byte]: 1,
}
const DECODE_MAP: { [T in Terminal]?: (array: DataView) => number | bigint | Date } = {
	[TerminalTypes.byte]: (value) => value.getUint8(0),
	[TerminalTypes.short]: (value) => value.getInt16(0, true),
	[TerminalTypes.int]: (value) => value.getInt32(0, true),
	[TerminalTypes.long]: (value) => value.getBigInt64(0, true),
	[TerminalTypes.float]: (value) => value.getFloat32(0, true),
	[TerminalTypes.double]: (value) => value.getFloat64(0, true),
	[TerminalTypes.date]: (value) => new Date(
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
	const onNumerical = (item: number) => {
		byteIdx = 0
		current = reverseMap[item]
		defaultDataView.len = TOKEN_MAP[current]
	}
	const onContainerStart = (item: number) => {
		const type = reverseMap[item]
		const value = CONTAINER_MAP[type]()
		onToken(value)
		//@ts-ignore
		expectedTokenStack.push({ type, value })
	}
	const onContainerEnd = (item: number) => {
		const obj = expectedTokenStack[expectedTokenStack.length-1]
		if(
			(obj.type === TerminalTypes.arrayStart && item !== terminals[TerminalTypes.arrayEnd]) ||
			(obj.type === TerminalTypes.objectStart && item !== terminals[TerminalTypes.objectEnd])
		) {
			throw new Error('Unexpected end of container found')
		}
		expectedTokenStack.pop()
	}
	const functionMap: ((i: number) => void)[] = new Array(256)
	functionMap[terminals[TerminalTypes.booleanTrue]] = () => onToken(true)
	functionMap[terminals[TerminalTypes.booleanFalse]] = () => onToken(false)
	functionMap[terminals[TerminalTypes.null]] = () => onToken(null)
	functionMap[terminals[TerminalTypes.string]] = () => {
		byteIdx = 0
		current = TerminalTypes.string
		defaultString = ''
	}
	functionMap[terminals[TerminalTypes.buffer]] = () => {
		byteIdx = 0
		current = TerminalTypes.buffer
		defaultBuffer.reset()
	}
	functionMap[terminals[TerminalTypes.byte]] = onNumerical
	functionMap[terminals[TerminalTypes.short]] = onNumerical
	functionMap[terminals[TerminalTypes.int]] = onNumerical
	functionMap[terminals[TerminalTypes.long]] = onNumerical
	functionMap[terminals[TerminalTypes.date]] = onNumerical
	functionMap[terminals[TerminalTypes.float]] = onNumerical
	functionMap[terminals[TerminalTypes.double]] = onNumerical

	functionMap[terminals[TerminalTypes.arrayStart]] = onContainerStart
	functionMap[terminals[TerminalTypes.objectStart]] = onContainerStart

	functionMap[terminals[TerminalTypes.arrayEnd]] = onContainerEnd
	functionMap[terminals[TerminalTypes.objectEnd]] = onContainerEnd

	let defaultString = ''
	let byteIdx = 0

	const expectedTokenStack: StackItem[] = []
	let current: Terminal
	
	let i = 0
	let len = 0

	const onToken = (value) => {
		finalValue = finalValue || value
		const obj = expectedTokenStack[expectedTokenStack.length-1]
		if(obj?.type === TerminalTypes.arrayStart) {
			obj.value.push(value)
		} else if(obj?.type === TerminalTypes.objectStart) {
			if(!obj.nextKey) {
				obj.nextKey = value 
			} else {
				obj.value[obj.nextKey] = value
				obj.nextKey = undefined
			}
		}
		current = undefined
	}
	const onByte = function(item: number) {
		if(!current) {
			functionMap[item](item)
		} else if(current === TerminalTypes.string) {
			if(item === 0) onToken(defaultString) 
			else defaultString += String.fromCharCode(item)
		} else if(current === TerminalTypes.buffer) {
			if(item === 0) onToken(defaultBuffer.getBuffer()) 
			else defaultBuffer.push(item)
		} else {
			defaultDataView.view.setUint8(byteIdx, item)
			byteIdx += 1
			
			if(byteIdx >= defaultDataView.len) {
				onToken(
					DECODE_MAP[current](defaultDataView.view)
				)
			}
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