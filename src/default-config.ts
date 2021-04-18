import { Config } from "./types";

export default {
	terminals: {
		arrayStart: 0xF0,
		arrayEnd: 0xF1,
	  
		objectStart: 0xF2,
		objectEnd: 0xF3,
		
    byte: 0xEA,
    int8: 0xEB,
    uint8: 0xEC,
    int16: 0xED,
    uint16: 0xEE,
    int32: 0xFA,
    uint32: 0xFB,
    int64: 0xFC,
    uint64: 0xFD,
	  
		double: 0xFE,
		float: 0xFF,
	  
		booleanTrue: 0xF4,
		booleanFalse: 0xF5,
	  
		string: 0xF6,
	  
		null: 0xD0,
		backspace: 0xD8,
		htab: 0xD9,
		linefeed: 0xDA,
		formfeed: 0xDC,
		carriagereturn: 0xDD
	  }
} as Config