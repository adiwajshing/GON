import { Readable, Stream } from "stream"

export type Terminals = {
	arrayStart: number
	arrayEnd: number

	objectStart: number
	objectEnd: number
	
	byte: number
  int8: number
  uint8: number
  int16: number
  uint16: number
  int32: number
  uint32: number
  int64: number
  uint64: number

	float: number
	double: number

	booleanTrue: number
	booleanFalse: number

  string: number
  
  null: number
  backspace: number
  htab: number
  linefeed: number
  formfeed: number
  carriagereturn: number
}
export type Config = {
	terminals: Terminals
}
export interface Serializer<T extends (Buffer | string)> {
	encode (obj: any): T
	decode (buff: T): any
	contentType: string
}

export type GONSerializer = Serializer<Buffer> & {
	decode(buffer: Buffer): any
	decode(stream: Readable): Promise<any>
}
  