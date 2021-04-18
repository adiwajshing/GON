# DCFG Detector

This is a submodule for GON. Given a CFG, it can check whether it is a DCFG or not.
Steps to verify:

1. Generate the branch NFA from a given CFG. See [cfg-to-nfa](/grammar/cfg-to-nfa.js).
2. Convert the said NFA to a DFA. See [nfa-to-dfa](/grammar/nfa-to-dfa.js).
3. Verify that it passes the DK test. See [index file](/grammar/index.js)