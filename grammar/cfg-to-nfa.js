const convertToNFA = (cfg) => {
	const nfa = { }

	const addRule = (start, transition, end, accepting) => {
		nfa[start] = nfa[start] || {}
		nfa[start][transition] = nfa[start][transition] || []
		nfa[start][transition].push(end)
		if(accepting) {
			nfa[end] = nfa[end] || {}
			nfa[end].accepting = true
		}
	}
	const generateRule = (prod, str) => {
		const getStateStr = i => prod + ' -> ' + states.slice(0, i).join(' ') + ' . ' + states.slice(i).join(' ')
		
		const states = str.split(' ')
		addRule('q0', 'e', getStateStr(0))

		for(let i = 0;i < states.length;i++) {
			addRule(
				getStateStr(i), 
				states[i], 
				getStateStr(i+1),
				i === states.length-1
			)
		}
	}
	const keys = Object.keys(cfg)
	for(const key of keys) {
		for(const str of cfg[key]) {
			generateRule(key, str)
		}
	}
	return nfa
}
module.exports.convertToNFA = convertToNFA