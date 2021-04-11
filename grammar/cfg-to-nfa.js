const convertToNFA = (cfg) => {
	const nfa = { }

	const addRule = (start, transition, end, accepting) => {
		nfa[start] = nfa[start] || {}
		nfa[start][transition] = nfa[start][transition] || []
		if(!nfa[start][transition].includes(end)) {
			nfa[start][transition].push(end)
		}
		if(accepting) {
			nfa[end] = nfa[end] || {}
			nfa[end].accepting = true
		}
	}
	const generateRule = (prod, str, epsilon) => {
		const getStateStr = i => prod + ' -> ' + states.slice(0, i).join(' ') + ' . ' + states.slice(i).join(' ')
		const addedEpsilonRules = {}
		const states = str.split(' ')
		if(!epsilon && prod === 'S') // only for S
			addRule('q0', 'e', getStateStr(0))

		for(let i = 0;i < states.length;i++) {
			const curFullState = getStateStr(i)
			if(epsilon) {
				const isNonTerminal = states[i].toUpperCase() === states[i]
				if(
					isNonTerminal && 
					!addedEpsilonRules[states[i]]
				) {
					for(const rule of Object.keys(nfa)) {
						if(rule.startsWith(`${states[i]} ->  . `)) {
							addRule(curFullState, 'e', rule)
						}
					}
					addedEpsilonRules[i] = states[i]
				}
			} else {
				addRule(
					curFullState, 
					states[i], 
					getStateStr(i+1),
					i === states.length-1
				)
			}
		}
	}
	const generateRules = (epsilon) => {
		const keys = Object.keys(cfg)
		for(const key of keys) {
			for(const str of cfg[key]) {
				generateRule(key, str, epsilon)
			}
		}
	}
	generateRules(false)
	generateRules(true)

	return nfa
}
module.exports.nfaMetadata = (nfa) => {
	const states = Object.keys(nfa).length
	let transitions = 0
	for(const obj of Object.values(nfa)) {
		for(const values of Object.values(obj)) {
			if(typeof values === 'string') {
				transitions += 1
			} else if(Array.isArray(values)) {
				transitions += values.length
			}
		}
	}
	return {
		states,
		transitions
	}
}
module.exports.convertToNFA = convertToNFA