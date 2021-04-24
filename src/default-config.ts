import { Config, TerminalTypes } from "./types";

export default {
	terminals: {
		[TerminalTypes.arrayStart]: 0xF0,
		[TerminalTypes.arrayEnd]: 0xF1,
	  
		[TerminalTypes.objectStart]: 0xF2,
		[TerminalTypes.objectEnd]: 0xF3,
		
		[TerminalTypes.byte]: 0xFA,
		[TerminalTypes.short]: 0xFB,
		[TerminalTypes.int]: 0xFC,
		[TerminalTypes.long]: 0xFD,

		[TerminalTypes.date]: 0xEF,
	  
		[TerminalTypes.double]: 0xFE,
		[TerminalTypes.float]: 0xFF,
	  
		[TerminalTypes.booleanTrue]: 0xF4,
		[TerminalTypes.booleanFalse]: 0xF5,
	  
		[TerminalTypes.string]: 0xF6,
		[TerminalTypes.buffer]: 0xF7,
	  
		[TerminalTypes.null]: 0xD0
	  }
} as Config