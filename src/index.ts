import { Readable } from "stream";
import { Config, Parser } from "./types";

export default (config: Config) => {
	return {
		encode: (value: any) => {
			return Buffer.from([])
		},
		decode: (value: Readable | Buffer) => {
			if(Buffer.isBuffer(value)) {
				return undefined
			} else {
				return Promise.resolve(undefined)
			}
		}
	} as Parser
}