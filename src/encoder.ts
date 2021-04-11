import { Config } from './types';

let globalConf: Config;
let encArr = new Array();

function encNull() {
  encArr.push(globalConf.terminals['null']);
}

/**
 * Encode object to binary
 * @param data Input object to encode
 */
export function encoder(config: Config, data: any) {
  globalConf = config;
  
  if (data == null) {
    encNull();
  }
  return encArr;
}
