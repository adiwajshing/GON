import { Readable, Stream } from "stream"

export type Terminals = {
	arrayStart: number
	arrayEnd: number

	objectStart: number
	objectEnd: number

	date: number

	byte: number
	short: number
	int: number
	long: number

	float: number
	double: number

	booleanTrue: number
	booleanFalse: number

	string: number
	buffer: number

	null: number
	backspace: number
	htab: number
	linefeed: number
	formfeed: number
	carriagereturn: number
}
export type ReverseTerminalMap = { [t: number]: keyof Terminals }
export type Config = {
	terminals: Terminals
}
export type FullInternalConfig = Config & {
	reverseMap: ReverseTerminalMap
}
export interface Serializer<T extends (Buffer | string)> {
	encode(obj: any): T
	decode(buff: T): any
	contentType: string
}

export type GONSerializer = Serializer<Buffer> & {
	decode(buffer: Buffer): any
	decode(stream: Readable): Promise<any>
}
