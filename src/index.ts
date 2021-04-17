import { Readable } from "stream";
import { Config, GONSerializer } from "./types";
import encode from "./encode";

export default (config: Config) => {
	return {
		encode: (value: any) => {
			const encArr: number[] = []
			encode(config, value, encArr)
			return Buffer.from(encArr)
		},
		decode: (value: Readable | Buffer) => {
			if(Buffer.isBuffer(value)) {
				return undefined
			} else {
				return Promise.resolve(undefined)
			}
		},
		contentType: 'application/octet-stream'
	} as GONSerializer
}