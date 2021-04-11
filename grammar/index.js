const CFG = require('./cfg.json')
const {convertToNFA} = require('./cfg-to-nfa')
const {convertToDFA} = require('./nfa-to-dfa')
const fs = require('fs')

const NFA = convertToNFA(CFG)
NFA['q'] = { // hack to make parsing easier
    a: 'q0',
    startingState: true
}
const DFA = convertToDFA(NFA)
const trueState = DFA.q.a  // revert hack
DFA[trueState].startingState = true
delete DFA['q']

fs.writeFileSync(
    './grammar/cfg-dfa.json',
    JSON.stringify(DFA, undefined, 2)
)
console.log('converted to DFA, verifying DCFG...')

let failed = ''
for(const state of Object.keys(DFA)) {
	if(DFA[state].accepting) {
		const states = state.split(',')
		for(const s of states) {
			if(s.includes(' . ') && !s.endsWith(' . ')) {
				failed = state
			}
		}
	}
	if(failed) break
}
if(failed) {
	console.log('CFG is not DCFG, DK test failer: ', failed)
} else {
	console.log('CFG is DCFG')
}
