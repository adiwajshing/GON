const tableDoublingBuffer = (initialCapacity: number) => {
	let buffAlloc = initialCapacity
	let dataView = Buffer.alloc(initialCapacity)
	let buffCursor = 0

	return {
		reset: () => buffCursor = 0,
		getBuffer: () => dataView.slice(0, buffCursor),
		push: (byte: number) => {
			if(buffCursor >= buffAlloc) {
			  dataView = Buffer.concat([ dataView, Buffer.alloc(buffAlloc) ])
			  buffAlloc *= 2
			}
			dataView[buffCursor] = byte
			buffCursor += 1
		}
	}
}
export type TableDoublingBuffer = ReturnType<typeof tableDoublingBuffer>
export default tableDoublingBuffer