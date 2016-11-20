const {link, Statement} = require('../src/linker');
const LCVMKernel = require('../src/vm/kernel');
const assert = require('assert');

const blankVM = new LCVMKernel();
describe('Statement::', function () {

	describe('Expression::', function () {
		describe('value::', function () {
			it('literal', function () {
				const syntaxNode = {
					BODY: {
						SYMBOL: 'LITERAL',
						DESTINATION: 'test'
					}
				};

				let ret = blankVM.run(new Statement.map['LITERAL'](syntaxNode));
				assert.equal(ret, 'test');
			});

			it('variable', function () {
				const syntaxNode = {
					BODY: {
						SYMBOL: 'VARIABLE',
						IDENTIFIER: 'abc'
					}
				};

				let ret = blankVM.run(new Statement.map['VARIABLE'](syntaxNode), {
					abc: 123
				});
				assert.equal(ret, 123);
			});
		});

		describe('BinaryOperator::', function () {
			describe('NoState::', function () {
				function generateNode(left, right, operator) {
					return new Statement.map[operator]({
						BODY: {
							SYMBOL: operator,
							LEFT: {
								BODY: {
									SYMBOL: 'LITERAL',
									DESTINATION: left
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'LITERAL',
									DESTINATION: right
								}
							}
						}
					});
				}

				const BinaryOperatorData = {
					'ES+': [
						{ left: 1, right: 3, ret: 4 },
						{ left: 'a', right: 4, ret: 'a4' },
						{ left: 2, right: 'b', ret: '2b' },
						{ left: 'a', right: 'b', ret: 'ab' }
					],
					'ES-': [
						{ left: 1, right: 3, ret: -2 },
						{ left: '5', right: 2, ret: 3 }
					],
					'ES*': [
						{ left: 1, right: 3, ret: 3 },
						{ left: '5', right: 2, ret: 10 }
					],
					'ES/': [
						{ left: 6, right: 3, ret: 2 },
						{ left: '100', right: 20, ret: 5 }
					],
					'ES%': [
						{ left: 1, right: 3, ret: 1 },
						{ left: '5', right: 2, ret: 1 }
					],
					'ES>': [
						{ left: 1, right: 3, ret: false },
						{ left: 1, right: '3', ret: false },
						{ left: 5, right: 3, ret: true },
						{ left: '5', right: 3, ret: true }
					],
					'ES>=': [
						{ left: 3, right: 3, ret: true },
						{ left: 1, right: 3, ret: false },
						{ left: '5', right: 3, ret: true },
					],
					'ES<': [
						{ left: 1, right: 3, ret: true },
						{ left: '5', right: 2, ret: false },
						{ left: '5', right: '6', ret: true }
					],
					'ES<=': [
						{ left: '5', right: 2, ret: false },
						{ left: '5', right: 5, ret: true }
					],
					'ES==': [
						{ left: '5', right: 6, ret: false },
						{ left: '5', right: 5, ret: true }
					],
					'ES!=': [
						{ left: '5', right: 6, ret: true },
						{ left: '5', right: 5, ret: false }
					],
					'ES===': [
						{ left: 6, right: 6, ret: true },
						{ left: '5', right: 6, ret: false },
						{ left: '5', right: 5, ret: false }
					],
					'ES!==': [
						{ left: 6, right: 6, ret: false },
						{ left: '5', right: 6, ret: true },
						{ left: '5', right: 5, ret: true }
					],
					'ES&&': [
						{ left: 1, right: 0, ret: false },
						{ left: true, right: true, ret: true },
						{ left: '', right: true, ret: false }
					],
					'ES||': [
						{ left: 1, right: 0, ret: true },
						{ left: true, right: true, ret: true },
						{ left: '', right: '', ret: false },
						{ left: '', right: true, ret: true }
					],
					'LC~~': [
						{ left: 'abc', right: 'b', ret: true },
						{ left: 'abc', right: 'd', ret: false },
						{ left: true, right: 't', ret: true },
						{ left: true, right: 'a', ret: false },
						{ left: 123, right: '1', ret: true },
						{ left: 123, right: 23, ret: true },
						{ left: 'It\'s false', right: false, ret: true },
						{ left: '52e4a22a499bc624', right: /[0-9a-f]{16}/, ret: true },
						{ left: /[0-9a-f]{16}/, right: '[0-9', ret: true },
					],
					'LC!~': [
						{ left: 'abc', right: 'b', ret: false },
						{ left: 'abc', right: 'd', ret: true }
					]
				};

				for(let operator in BinaryOperatorData) {
					it(operator, function () {
						BinaryOperatorData[operator].forEach(({left, right, ret}) => {
							const syntaxNode = generateNode(left, right, operator);
							let $ret = blankVM.run(syntaxNode);
							assert.equal(ret, $ret);
						});
					});
				}
			});

			describe('State::', function () {
				function generateNode(sources, operator) {
					return new Statement.map[operator]({
						BODY: {
							SYMBOL: operator,
							IDENTIFIER: 'test',
							SOURCES: {
								BODY: {
									SYMBOL: 'LITERAL',
									DESTINATION: sources
								}
							}
						}
					});
				}

				const BinaryOperatorData = {
					'ES=': [
						{ sources: 45, ret: 45 }
					],
					'ES+=': [
						{ sources: 45, ret: 295 }
					],
					'ES-=': [
						{ sources: 45, ret: 205 }
					],
					'ES*=': [
						{ sources: 2, ret: 500 }
					],
					'ES/=': [
						{ sources: 50, ret: 5 }
					],
					'ES%=': [
						{ sources: 45, ret: 25 }
					],
				};

				for(let operator in BinaryOperatorData) {
					it(operator, function () {
						BinaryOperatorData[operator].forEach(({sources, ret}) => {
							const syntaxNode = generateNode(sources, operator);
							const $ret = blankVM.run(syntaxNode, { test: 250 });
							assert.equal(ret, $ret);
						});
					});
				}
			});
		});

		describe('TernaryOperator::', function () {
			it('ES?:', function () {
				const node = new Statement.map['ES?:']({
					BODY: {
						SYMBOL: 'ES?:',
						CONDITION: {
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: false
							}
						},
						TRUE: {
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: 123
							}
						},
						FALSE: {
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: 456
							}
						}
					}
				});

				let $ret = blankVM.run(node);
				assert.equal(456, $ret);

			});
		});

		describe('UnaryOperator::', function () {
			it('ES!', function () {
				const node = new Statement.map['ES!']({
					BODY: {
						SYMBOL: 'ES!',
						SOURCES: {
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: true
							}
						}
					}
				});

				let $ret = blankVM.run(node);
				assert.equal(false, $ret);
			});
			it('ES^++', function () {
				
			});
			it('ES^--', function () {

			});
			it('ES++$', function () {

			});
			it('ES--$', function () {

			});

			it('Selector:: *', function (done) {
				const node = new Statement.map['LC<!']({
					BODY: {
						SYMBOL: 'LC<!',
						SELECTOR: {
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: 'body a'
							}
						}
					}
				});

				blankVM.on('fetch', function (request) {
					assert.deepEqual(request.invoking, {
						method: 'isDisplay',
						args: {
							selector: 'body a'
						}
					});
					done();
				});

				blankVM.run(node);
			});
		});
	});

	describe('Control::', function () {
		it('while {...}', function () {
			const node = new Statement.map['LOOP']({
				BODY: {
					SYMBOL: 'LOOP',
					CONDITION: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: false
						}
					},
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: true
							}
						}
					]
				}
			});
			var index = 0;
			blankVM.on('[loop]', vm => {
				index++;
				if (index < 5) {
					vm.ret = true;
				}
			});
			blankVM.run(node);
			assert.equal(index, 5);
		});
		
		it('if {...} else {...}', function () {
			const node =  new Statement.map['BRANCH']({
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
								DESTINATION: 'abc'
							}
						}
					],
					SEGMENT_FALSE: [
						{
							BODY: {
								SYMBOL: 'LITERAL',
								DESTINATION: 'def'
							}
						}
					]
				}
			});
			let $ret = blankVM.run(node);
			assert.equal($ret, 'def');
		});

		it('process {...} | call | return', function () {
			const process = {
				BODY: {
					SYMBOL: 'PROCESS',
					IDENTIFIER: 'main',
					PARAMETER: [],
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'RETURN',
								RET: {
									BODY: {
										SYMBOL: 'LITERAL',
										DESTINATION: 'xyz'
									}
								}
							}
						}
					]
				}
			};
			const vm = new LCVMKernel(link([process]));
			
			vm.on('loop-end', vm => {
				assert.equal(vm.ret, 'xyz');
			});
			vm.$bootstrap();
			assert.equal(vm.ret, null);
		});
	});

	describe('Native::', function () {
		this.timeout(5000);

		it('wait', function (done) {
			const node = new Statement.map['WAIT']({
				BODY: {
					SYMBOL: 'WAIT',
					DELAY: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: 3000
						}
					}
				}
			});

			const vm = new LCVMKernel();
			vm.on('[WAIT]', vm => {
				assert(Symbol.for('EXECUTING'), vm.signal);
			});

			vm.run(node);
			assert(Symbol.for('BLOCKED'), vm.signal);

			setTimeout(() => {
				assert.equal(vm.signal, Symbol.for('BLOCKED'));
				done();
			}, 2500);
		});

		it('assert', function (done) {
			const process = {
				BODY: {
					SYMBOL: 'PROCESS',
					IDENTIFIER: 'main',
					PARAMETER: [],
					SEGMENT: [
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
										DESTINATION: 2000
									}
								}
							}
						}
					]
				}
			};
			const vm = new LCVMKernel(link([process]));
			
			vm.on('loop-end', vm => {
				assert.equal(vm.ret, true);
				done();
			});

			let ai = 0;
			vm.on('[ASSERT]', vm => {
				ai++;
				if (ai === 20) {
					vm.ret = true;
				}
			});

			vm.$bootstrap();

		});

		it('log', function () {
			const node = new Statement.map['LOG']({
				BODY: {
					SYMBOL: 'LOG',
					LOG: {
						BODY: {
							SYMBOL: 'LITERAL',
							DESTINATION: 'A log'
						}
					}
				}
			});

			let $ret = blankVM.run(node);
			assert.equal($ret, 'A log');
		});
	});
});