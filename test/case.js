const Case = require('../src/vm/case');
require('../src/linker/statement/executable/expression');
require('../src/linker/statement/executable/jumpto');
require('../src/linker/statement/executable/wait');
require('../src/linker/statement/executable/return');
require('../src/linker/statement/control/branch');
require('../src/linker/statement/control/loop');
const Process = require('../src/linker/statement/control/process');

const syntaxTreeA = {
	BODY: {
		SYMBOL: 'PROCESS',
		IDENTIFIER: 'main',
		SEGMENT: [
			{
				BODY: {
					SYMBOL: 'EXPRESSION',
					EXPRESSION: '\"hello world2!\"'
				}
			},
			{
				BODY: {
					SYMBOL: 'BRANCH',
					CONDITION: {
						BODY: {
							SYMBOL: 'EXPRESSION',
							EXPRESSION: false
						}
					},
					SEGMENT_TRUE: [
						{
							BODY: {
								SYMBOL: 'EXPRESSION',
								EXPRESSION: 'BRANCH_TRUE'
							}
						},
						{
							BODY: {
								SYMBOL: 'RETURN', 
								RET: {
									BODY: {
										SYMBOL: 'EXPRESSION',
										EXPRESSION: 250
									}
								}
							}
						},
					],
					SEGMENT_FALSE: [
						{
							BODY: {
								SYMBOL: 'EXPRESSION',
								EXPRESSION: 'BRANCH_FALSE'
							}
						}
					]
				}
			},
			{
				BODY: {
					SYMBOL: 'JUMPTO',
					URL: {
						BODY: {
							SYMBOL: 'EXPRESSION',
							EXPRESSION: '\"http://hello.world\"'
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'WAIT',
					DELAY: {
						BODY: {
							SYMBOL: 'EXPRESSION',
							EXPRESSION: 1000
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'CALL',
					IDENTIFIER: 'sub'
				}
			},
			{
				BODY: {
					SYMBOL: 'LOOP',
					CONDITION: {
						BODY: {
							SYMBOL: 'EXPRESSION',
							EXPRESSION: true
						}
					},
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'EXPRESSION',
								EXPRESSION: '[LOOP] running'
							}
						}
					]
				}
			},
			{
				BODY: {
					SYMBOL: 'RETURN', 
					RET: {
						BODY: {
							SYMBOL: 'EXPRESSION',
							EXPRESSION: 2000
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'EXPRESSION',
					EXPRESSION: '\"hello world3!\"'
				}
			}
		]
	}
};

const syntaxTreeB = {
	BODY: {
		SYMBOL: 'PROCESS',
		IDENTIFIER: 'sub',
		SEGMENT: [
			{
				BODY: {
					SYMBOL: 'EXPRESSION',
					EXPRESSION: '[Process sub] hello world'
				}
			}
		]
	}
};

const cccc = new Case({
	processList: {
		main: new Process(syntaxTreeA),
		sub: new Process(syntaxTreeB)
	}
});

var index = 0;
cccc.on('[loop]', vm => {
	vm.ret = index < 5;
	index++;
});

cccc.on('$fetch', (invoking, vm) => {
	console.log('[REMOTE]', invoking);
	vm.respond();
});
cccc.on('$writeback', (err, ret) => {
	console.log(ret);
});
cccc.on('loop-end', vm => {
	console.log('[VM-end]');
});

cccc.$bootstrap();