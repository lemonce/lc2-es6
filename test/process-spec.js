const {link, LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe.only('Process::', function () {
	this.timeout(10000);
/**
process main () {
	test();

	click 'body a';
	return 2;
}

process test() {
	a = 1;
	if (a === 1) {
		return 5;
	}
}
 */
	it('sync-call', function (done) {
		const processMap = {
			main: {
				BODY: {
					IDENTIFIER: 'main',
					PARAMETER: [],
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'CALL',
								IDENTIFIER: 'test',
								ARGUMENTS: []
							}
						},
						{
							BODY: {
								SYMBOL: 'ACTION::CLICK',
								SELECTOR: {
									BODY: {
										SYMBOL: 'LITERAL::SIMPLE',
										DESTINATION: 'body a'
									}
								}
							}
						},
						{
							BODY: {
								SYMBOL: 'RETURN',
								RET: {
									BODY: {
										SYMBOL: 'LITERAL::SIMPLE',
										DESTINATION: 2
									}
								}
							}
						}
					]
				}
			},
			test: {
				BODY: {
					IDENTIFIER: 'test',
					PARAMETER: [],
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'ES=',
								LEFT: {
									BODY: {
										SYMBOL: 'ACCESS::VARIABLE',
										IDENTIFIER: 'a'
									}
								},
								RIGHT: {
									BODY: {
										SYMBOL: 'LITERAL::SIMPLE',
										DESTINATION: 1
									}
								}
							}
						},
						{
							BODY: {
								SYMBOL: 'BRANCH',
								CONDITION: {
									BODY: {
										SYMBOL: 'ES===',
										LEFT: {
											BODY: {
												SYMBOL: 'ACCESS::VARIABLE',
												IDENTIFIER: 'a'
											}
										},
										RIGHT: {
											BODY: {
												SYMBOL: 'LITERAL::SIMPLE',
												DESTINATION: 1
											}
										}
									}
								},
								SEGMENT_TRUE: [
									{
										BODY: {
											SYMBOL: 'RETURN',
											RET: {
												BODY: {
													SYMBOL: 'LITERAL::SIMPLE',
													DESTINATION: 5
												}
											}
										}
									}
								]
							}
						}
					]
				}

			}
		};

		const executionTree = link({processMap});
		const vm2 = new LCVM(executionTree);
		vm2.on('writeback', (err, ret) => {
			console.log('WB', ret, err);
		});

		vm2.on('case-end', () => {
			done();
		});
		
		vm2.on('fetch', rpc => {
			rpc.async(() => {
				return new Promise(resolve => setTimeout(resolve, 1500));
			});
		});

		vm2.start();
	});

});