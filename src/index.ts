import { Readable } from "stream";
import encode from "./encode";
import decode from "./decode";
import { Config, FullInternalConfig, ReverseTerminalMap, GONSerializer } from "./types";
import DefaultConfig from "./default-config";

export const makeGONSerializer = (config: Config) => {
	const reverseMap: ReverseTerminalMap = Object.keys(config.terminals)
									.reduce((dict, key) => (
										{ ...dict, [config.terminals[key]]: key }
									), { })
	const fullConfig: FullInternalConfig = { ...config, reverseMap }
	return {
		encode: (value: any) => encode(config, value),
		decode: (value: Readable | Buffer) => decode(fullConfig, value),
		contentType: 'application/octet-stream'
	} as GONSerializer
}

export default makeGONSerializer(DefaultConfig)