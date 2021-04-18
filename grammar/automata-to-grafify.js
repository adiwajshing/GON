module.exports.convertToGrafify = (dfa) => {
	const map = {}
	
	const edges = Object.keys(dfa)
				.map(key => (
					Object.values(dfa[key])
						.filter(k => typeof k === 'string' || Array.isArray(k))
						.flat()
						.map(key2 => {
							if(!map[key]) map[key] = key
							if(!map[key2]) map[key2] = key2

							return {
								source: map[key],
								target: map[key2]
							}
						})
				))
				.flat()
	const graph = {
		nodes: Object.values(map).map(id => ({ id })),
		edges
	}
	return graph
}