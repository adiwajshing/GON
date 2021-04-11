// load modules
const CFG = require('./inputs/cfg.json')
const {convertToNFA, nfaMetadata} = require('./cfg-to-nfa')
const {convertToDFA} = require('./nfa-to-dfa')
const {convertToGrafify} = require('./automata-to-grafify')
const fs = require('fs')

// generate the NFA
const NFA = convertToNFA(CFG)
// save NFA
fs.writeFileSync(
    './grammar/outputs/nfa.json',
    JSON.stringify(NFA, undefined, 2)
)
// print some metadata
console.log('NFA metadata', nfaMetadata(NFA))

// hack to make parsing easier for this implementation
// add an initial state with no epsilon transitions
NFA['q'] = { 
    a: 'q0',
    startingState: true
}
// generate the NFA from the DFA
const DFA = convertToDFA(NFA)
// revert hack
// remove the added implementation
const trueState = DFA.q.a  
DFA[trueState].startingState = true
delete DFA['q']
// output the DFA
fs.writeFileSync(
    './grammar/outputs/dfa.json',
    JSON.stringify(DFA, undefined, 2)
)

fs.writeFileSync(
	'./grammar/outputs/grafify.json',
	JSON.stringify(convertToGrafify(DFA), undefined, 2)
)

console.log('converted to DFA, verifying DCFG...')

// verify
let failed = ''
for(const state of Object.keys(DFA)) {
	if(DFA[state].accepting) { // if state is accepting
		const states = state.split(',')
		for(const s of states) {
			// there should be no state that has a ` . ` and does not end with it.
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
