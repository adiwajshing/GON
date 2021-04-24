import { Readable } from "stream"

export enum TerminalTypes {
	arrayStart = 1,
	arrayEnd = 2,

	objectStart = 3,
	objectEnd = 4,

	date = 5,

	byte = 6,
	short = 7,
	int = 8,
	long = 9,

	float = 10,
	double = 11,

	booleanTrue = 12,
	booleanFalse = 13,

	string = 14,
	buffer = 15,

	null = 16
}

export type Terminals = { [V in TerminalTypes]: number }
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
