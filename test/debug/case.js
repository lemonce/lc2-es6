/*eslint-disable*/
const {ESVM} = require('../src/esvm');
const {link} = require('../src/lcvm');

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
					IDENTIFIER: 'sub',
					ARGUMENTS: [
						{
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: 'abecd'
							}
						}
					]
				}
			},
			{
				BODY: {
					SYMBOL: 'CALL',
					IDENTIFIER: 'random',
					ARGUMENTS: [
						{
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: /\w{5,10}/
							}
						}
					]
				}
			},
			{
				BODY: {
					SYMBOL: 'ES=',
					IDENTIFIER: 'length',
					SOURCES: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: 3
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'ES=',
					IDENTIFIER: 'index',
					SOURCES: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: 0
						}
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'LOOP',
					CONDITION: {
						BODY: {
							SYMBOL: 'ES<',
							LEFT: {
								BODY: {
									SYMBOL: 'VARIABLE',
									IDENTIFIER: 'index'
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'VARIABLE',
									IDENTIFIER: 'length'
								}
							}
						}
					},
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: '[LOOP] running'
							}
						},
						{
							BODY: {
								SYMBOL: 'ES=',
								IDENTIFIER: 'index',
								SOURCES: {
									BODY: {
										SYMBOL: 'ES+',
										LEFT: {
											BODY: {
												SYMBOL: 'VARIABLE',
												IDENTIFIER: 'index'
											}
										},
										RIGHT: {
											BODY: {
												SYMBOL: 'LITERAL',
												DESTINATION: 1
											}
										}
									}
								}
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
		PARAMETER: ['abc'],
		SEGMENT: [
			{
				BODY: {
					SYMBOL: 'LITERAL',
					DESTINATION: '[Process sub] hello world'
				}
			},
			{
				BODY: {
					SYMBOL: 'VARIABLE',
					IDENTIFIER: 'abc'
				}
			},
			{
				BODY: {
					SYMBOL: 'VARIABLE',
					IDENTIFIER: '$LOOP'
				}
			}
		]
	}
};

const cccc = new LCVM(link([
	syntaxTreeA, syntaxTreeB
]));

const {Response} = require('../src/vm/rpc');
cccc.on('fetch', (request, vm) => {
	console.log('[REMOTE]', request.invoking);
	setTimeout(() => {
		vm.respond(new Response(request));
	}, 40);
});
cccc.on('$writeback', (err, ret) => {
	console.log(ret);
});
cccc.on('loop-start', scope => {
	scope.abc = 234567;
});
cccc.on('loop-end', vm => {
	console.log('[VM-end]', vm.position);
});

cccc.$bootstrap();