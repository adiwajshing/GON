import { Config } from "./types";

export default (config: Config) => {
	return {
		encode: (value: any) => {
			return Buffer.from([])
		},
		decode: (buffer: Buffer) => {
			return undefined
		}
	}
}