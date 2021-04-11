import { Readable, Stream } from "stream"

export type Terminals = {
	arrayStart: number
	arrayEnd: number

	objectStart: number
	objectEnd: number
	
	byte: number
	short: number
	int: number
	long: number

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
export type Parser = {
	decode(buffer: Buffer): any
	decode(stream: Readable): Promise<any>

	encode(value: any): Buffer
}