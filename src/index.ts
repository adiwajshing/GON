import { Readable } from "stream";
import { Config, GONSerializer } from "./types";
import { encoder } from "./encoder";

export default (config: Config) => {
	return {
		encode: (value: any) => {
      		return Buffer.from(encoder(config, value));
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