import { 
	serialize as V8Encode, 
	deserialize as V8Decode 
} from 'v8'
import { Serializer } from '../types'

export const JSONSerializer: Serializer<string> = {
  encode: (obj: any) => JSON.stringify(obj),
  decode: (buff: string) => JSON.parse(buff),
  contentType: 'application/json'
}
export const V8Serializer: Serializer<Buffer> = {
  encode: (obj: any) => V8Encode(obj),
  decode: (buff: Buffer) => V8Decode(buff),
  contentType: 'application/octet-stream'
}