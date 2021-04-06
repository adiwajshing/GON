export type Terminals = {
	arrayStart: number
	arrayEnd: number

	objectStart: number 
	objectEnd: number
	
	byte: number 
	short: number
	int: number
	long: number

	float: number
	double: number 

	booleanTrue: number
	booleanFalse: number

	string: number
}
export type Config = {
	terminals: Terminals
}