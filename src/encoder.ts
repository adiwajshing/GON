import { Config } from './types';

let globalConf: Config;
let encArr = new Array();

function encNull() {
  encArr.push(globalConf.terminals['null']);
}

function encBool(obj: any) {
  if (obj === true) {
    encArr.push(globalConf.terminals['booleanTrue']);
  } else {
    encArr.push(globalConf.terminals['booleanFalse']);
  }
}

/**
 * Encode object to binary
 * @param data Input object to encode
 */
export function encoder(config: Config, data: any) {
  globalConf = config;
  
  if (data == null) {
    encNull();
  } else if (typeof data == "boolean") {
    encBool(data);
  }
  return encArr;
}
