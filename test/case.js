const Case = require('../src/vm/case');
require('../src/linker/statement/executable/expression/literal');
require('../src/linker/statement/executable/expression/sync');
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
					SYMBOL: 'ES+',
					LEFT: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: '[ES+]hello '
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'ES+',
							LEFT: {
								BODY: {
									SYMBOL: 'LITERAL',
									DESTINATION: 'world.'
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'LITERAL',
									DESTINATION: 23333
								}
							}
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'BRANCH',
					CONDITION: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: false
						}
					},
					SEGMENT_TRUE: [
						{
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: 'BRANCH_TRUE'
							}
						},
						{
							BODY: {
								SYMBOL: 'RETURN', 
								RET: {
									BODY: {
										SYMBOL: 'LITERAL',
										DESTINATION: 250
									}
								}
							}
						},
					],
					SEGMENT_FALSE: [
						{
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: 'BRANCH_FALSE'
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
							SYMBOL: 'LITERAL',
							DESTINATION: '\"http://hello.world\"'
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'WAIT',
					DELAY: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: 1000
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
							SYMBOL: 'LITERAL',
							DESTINATION: true
						}
					},
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: '[LOOP] running'
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
							SYMBOL: 'LITERAL',
							DESTINATION: 2000
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'LITERAL',
					DESTINATION: '\"hello world3!\"'
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
					SYMBOL: 'LITERAL',
					DESTINATION: '[Process sub] hello world'
				}
			}
		]
	}
};

const cccc = new Case({
	processMap: {
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