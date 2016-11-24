/*eslint-disable*/
const {LCVM, link} = require('../../src/lcvm');

const syntaxTreeA = {
	BODY: {
		SYMBOL: 'PROCESS',
		IDENTIFIER: 'main',
		PARAMETER: [],
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
									SYMBOL: 'VARIABLE',
									IDENTIFIER: 'abc'
								}
							}
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'BROWSER::JUMPTO',
					URL: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: 'http://hello.world'
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'ASSERT',
                    TEST: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: false
						}
                    },
					LIMIT: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: 1000
						}
					}
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
			}
		]
	}
};

const cccc = new LCVM(link({
	processList: [syntaxTreeA],
	options: {}
}));

const {Response} = require('../../src/esvm').rpc;
cccc.on('fetch', (request, vm) => {
	console.log('[REMOTE]', request.invoking);
	setTimeout(() => {
		vm.respond(new Response(request));
	}, 40);
});

let ai = 0;
cccc.on('[ASSERT]', vm => {
    ai++;
    if (ai == 20) {
        vm.ret = true;
    }
});
cccc.on('writeback', (err, ret) => {
	console.log('[TEST]', ret);
});
cccc.on('loop-start', scope => {
	scope.abc = 234567;
});
cccc.on('loop-end', vm => {
	console.log('[VM-end]', vm.position);
});

cccc.start();
