module.exports.convertToDFA = (nfa) => {
	const dfa = {}

	const startingState = Object.keys(nfa).find(item => nfa[item].startingState)

	const acceptingStates = new Set(
		Object.keys(nfa).filter(key => (
			nfa[key].accepting
		))
	)

	const getTransitionKeys = state => (
		Object.keys(state).filter(k => k !== 'startingState' && k !== 'accepting' && k !== 'e')
	)
	
	const evaluateState = (state, onlyEpsilons) => {
		const transitions = onlyEpsilons ? [ 'e' ] : getTransitionKeys(state)
		if(onlyEpsilons && !state['e']) return { 'e': [] }
		
		return transitions.reduce((s, transition) => {
			const states = typeof state[transition] === 'string' ? [ state[transition] ] : state[transition]
			
			// find states only reachable via an epsilon move
			const values = states
					.map(state => evaluateState(nfa[state], true))
					.map(item => item.e)
					.flat()
			// dedupe states
			const total = new Set([...states, ...values])

			return {
				...s,
				[transition]: Array.from(total)
			}
		}, {})
	}
	const evaluateStateByName = (stateName) => {
		const states = stateName.split(',')
		// combine into one state
		const state = states
			.map(item => evaluateState(nfa[item]))
			.reduce((s, state) => {
			const transitions = Object.keys(state)
			transitions.forEach(transition => {
				s[transition] = Array.from(
					new Set([ ...(s[transition] || []), ...state[transition] ])
				)
			})
			return s
		}, {})

		if(!!states.filter(state => acceptingStates.has(state)).length) {
			state.accepting = true
		}
		return state
	}
	const evaluateStateAndAddToList = (stateName) => {
		const state = evaluateStateByName(stateName)
		dfa[stateName] = state

		getTransitionKeys(state).forEach(transition => {
			const key = state[transition].sort().join(',')
			if(!dfa[key])
			evaluateStateAndAddToList(key)
		})
	}
	evaluateStateAndAddToList(startingState)
	
	dfa[startingState].startingState = true
	// convert the array states back to strings
	Object.values(dfa).forEach(item => {
		Object.keys(item).forEach(key => {
			if(Array.isArray(item[key])) {
				item[key] = item[key].sort().join(',')
			}
		})
	})
	
	return dfa
}