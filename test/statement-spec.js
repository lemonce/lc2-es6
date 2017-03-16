'use strict';
const {link, LCVM} = require('../src');
const {Statement, signal} = require('es-vm');
const assert = require('assert');

const blankVM = new LCVM();
describe('Statement::', function () {

	describe('Expression::', function () {
		describe('value::', function () {
			it('LITERAL::SIMPLE', function () {
				const syntaxNode = {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 'test'
					}
				};

				let ret = blankVM.run(new Statement.map['LITERAL::SIMPLE'](syntaxNode));
				assert.equal(ret, 'test');
			});

			it('variable', function () {
				const syntaxNode = {
					BODY: {
						SYMBOL: 'ACCESS::VARIABLE',
						IDENTIFIER: 'abc'
					}
				};

				let ret = blankVM.run(new Statement.map['ACCESS::VARIABLE'](syntaxNode), {
					abc: 123
				});
				assert.equal(ret, 123);
			});
		});

		describe('BinaryOperator::', function () {
			describe('NoState -E::', function () {
				function generateNode(left, right, operator) {
					return new Statement.map[operator]({
						BODY: {
							SYMBOL: operator,
							LEFT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
									DESTINATION: left
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
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
						{ left: '100', right: 20, ret: 5 },
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

			describe('NoState +E::', function () {
				function generateNode(left, right, operator) {
					return new Statement.map[operator]({
						BODY: {
							SYMBOL: operator,
							LEFT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
									DESTINATION: left
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
									DESTINATION: right
								}
							}
						}
					});
				}

				const BinaryOperatorData = {
					'ES-': [
						{ left: 1, right: 'aaa'},
						{ left: '5', right: NaN},
						{ left: Infinity, right: 1}
					],
					'ES*': [
						{ left: '5', right: NaN},
						{ left: Infinity, right: 1}
					],
					'ES/': [
						{ left: '5', right: NaN},
						{ left: 1, right: 0},
						{ left: 0, right: 0}
					],
					'ES%': [
						{ left: 3, right: 0},
						{ left: '5', right: 'bbb'}
					]
				};

				for(let operator in BinaryOperatorData) {
					it(operator, function () {
						BinaryOperatorData[operator].forEach(({left, right, ret}) => {
							const syntaxNode = generateNode(left, right, operator);
							const vm = new LCVM();
							let $ret = vm.run(syntaxNode);
							assert.equal($ret, null);
						});
					});
				}
			});

			describe('State -E::', function () {
				function generateNode(sources, operator) {
					return new Statement.map[operator]({
						BODY: {
							SYMBOL: operator,
							LEFT: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'test'
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
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

			describe('State +E::', function () {
				function generateNode(sources, operator) {
					return new Statement.map[operator]({
						BODY: {
							SYMBOL: operator,
							LEFT: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'test'
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
									DESTINATION: sources
								}
							}
						}
					});
				}

				const BinaryOperatorData = {
					'ES-=': [
						{ sources: 'aaa'},
						{ sources: Infinity}
					],
					'ES*=': [
						{ sources: NaN}
					],
					'ES/=': [
						{ sources: 0}
					],
					'ES%=': [
						{ sources: 0}
					],
				};

				for(let operator in BinaryOperatorData) {
					it(operator, function () {
						BinaryOperatorData[operator].forEach(({sources, ret}) => {
							const syntaxNode = generateNode(sources, operator);
							const vm = new LCVM();
							const $ret = vm.run(syntaxNode, { test: 250 });
							assert.equal($ret, null);
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
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: false
							}
						},
						TRUE: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 123
							}
						},
						FALSE: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
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
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'body a'
							}
						}
					}
				});

				blankVM.on('fetch', (rpc, invoking) => {
					assert.deepEqual(invoking, {
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

		describe('LogicOperator::', function () {
			describe('Short-Circut::', function () {
				function generateNode(left, operator) {
					return new Statement.map[operator]({
						BODY: {
							SYMBOL: operator,
							LEFT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
									DESTINATION: left
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'ES=',
									LEFT: {
										BODY: {
											SYMBOL: 'ACCESS::VARIABLE',
											IDENTIFIER: 'test'
										}
									},
									RIGHT: {
										BODY: {
											SYMBOL: 'LITERAL::SIMPLE',
											DESTINATION: 45
										}
									}
								}
							}
						}
					});
				}

				const LogicOperatorData = {
					'ES&&': [
						{ left: 1, ret: 45, shortcircut: false},
						{ left: '', ret: '', shortcircut: true }
					],
					'ES||': [
						{ left: 1, ret: 1, shortcircut: true },
						{ left: '', ret: 45, shortcircut: false }
					]
				};
				var signal;
				for(let operator in LogicOperatorData) {
					it(operator, function () {
						LogicOperatorData[operator].forEach(({left, ret, shortcircut}) => {
							signal = true;
							const syntaxNode = generateNode(left, operator);
							let $ret = blankVM.run(syntaxNode, {test: 250});
							assert.equal(ret, $ret);
							assert.equal(shortcircut, signal);
						});
					});
				}
				blankVM.on('writeback', (err, ret) => {
					if(ret === 45) {
						signal = false;
					}
				});
			});

		});
	});

	describe('Control::', function () {
		it('while {...}', function () {
			const node = new Statement.map['LOOP::WHILE']({
				BODY: {
					SYMBOL: 'LOOP::WHILE',
					CONDITION: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: false
						}
					},
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
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
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: false
						}
					},
					SEGMENT_TRUE: [
						{
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'abc'
							}
						}
					],
					SEGMENT_FALSE: [
						{
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'def'
							}
						}
					]
				}
			});
			let $ret = blankVM.run(node);
			assert.equal($ret, 'def');
		});

		it('process () {...} | call | return', function () {
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
										SYMBOL: 'LITERAL::SIMPLE',
										DESTINATION: 'xyz'
									}
								}
							}
						}
					]
				}
			};
			const vm = new LCVM(link([process]));
			
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
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 3000
						}
					}
				}
			});

			const vm = new LCVM();
			vm.on('[WAIT]', vm => {
				assert(signal.get('EXECUTING'), vm.signal);
			});

			vm.run(node);
			assert(signal.get('BLOCKED'), vm.signal);

			setTimeout(() => {
				assert.equal(vm.signal, signal.get('BLOCKED'));
				done();
			}, 2500);
		});

		describe('assert::', function () {
			this.timeout(8000);

			const node = {
				BODY: {
					SYMBOL: 'ASSERT',
					TEST: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: false
						}
					},
					LIMIT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 1000
						}
					}
				}
			};

			it('true', function (done) {
				const vm1 = new LCVM();
				vm1.on('loop-end', vm => {
					assert.equal(vm.ret, true);
					done();
				});
				let ai = 0;
				vm1.on('[ASSERT]', vm => {
					ai++;
					if (ai === 10) {
						vm.ret = true;
					}
				});
				vm1.run(new Statement.map['ASSERT'](node));
			});

			it('false', function (done) {
				const vm0 = new LCVM();
				vm0.on('error', err => {
					assert.equal(vm0.signal, signal.get('ERROR_HALTING'));
				});

				vm0.on('loop-end', vm => {
					assert.equal(vm.ret, false);
					done();
				});

				vm0.run(new Statement.map['ASSERT'](node));
			});

		});

		it('log', function () {
			const node = new Statement.map['LOG']({
				BODY: {
					SYMBOL: 'LOG',
					LOG: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 'A log'
						}
					}
				}
			});

			let $ret = blankVM.run(node);
			assert.equal($ret, 'A log');
		});
	});

	describe('driver::', function () {
		describe('browser::', function () {
			it('back', function (done) {
				const blankVM = new LCVM();
				const node = new Statement.map['BROWSER::BACK']({
					BODY: {
						SYMBOL: 'BROWSER::BACK'
					}
				});

				blankVM.on('fetch', (rpc, invoking) => {
					assert.deepEqual(invoking, {
						method: 'back',
						args: {}
					});
					done();
				});

				blankVM.run(node);
			});

			it('forward', function (done) {
				const blankVM = new LCVM();
				const node = new Statement.map['BROWSER::FORWARD']({
					BODY: {
						SYMBOL: 'BROWSER::FORWARD'
					}
				});

				blankVM.on('fetch', (rpc, invoking) => {
					assert.deepEqual(invoking, {
						method: 'forward',
						args: {}
					});
					done();
				});

				blankVM.run(node);
			});

			it('refresh', function (done) {
				const blankVM = new LCVM();
				const node = new Statement.map['BROWSER::REFRESH']({
					BODY: {
						SYMBOL: 'BROWSER::REFRESH'
					}
				});

				blankVM.on('fetch', (rpc, invoking) =>  {
					assert.deepEqual(invoking, {
						method: 'refresh',
						args: {}
					});
					done();
				});

				blankVM.run(node);
			});

			it('jumpto', function (done) {
				const blankVM = new LCVM();
				const node = new Statement.map['BROWSER::JUMPTO']({
					BODY: {
						SYMBOL: 'BROWSER::JUMPTO',
						URL: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'http://baidu.com'
							}
						}
					}
				});

				blankVM.on('fetch', (rpc, invoking) =>  {
					assert.deepEqual(invoking, {
						method: 'jumpto',
						args: { url: 'http://baidu.com' }
					});
					done();
				});

				blankVM.run(node);
			});

			it('resize', function () {

			});
		});

		describe('action::', function () {
			this.timeout(2000);

			const pointerSymbolMap = {
				'ACTION::CLICK': 'doClick',
				'ACTION::DBLCLICK': 'doDblclick',
				'ACTION::DROP': 'doDrop',
				'ACTION::HOLD': 'doHold',
				'ACTION::SCROLL': 'doScroll',
				'ACTION::MOVE': 'doMove'
			};

			function genNode(symbol) {
				return new Statement.map[symbol]({
					BODY: {
						SYMBOL: symbol,
						SELECTOR: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'body a'
							}
						}
					}
				});
			}

			for(let symbol in pointerSymbolMap) {
				it(symbol, function () {
					const vm = new LCVM();
					vm.on('fetch', (rpc, invoking) =>  {
						if (invoking.method === 'doDrop') {
							assert.deepEqual(invoking, {
								method: 'doDrop',
								args: {}
							});
							return;
						}

						assert.deepEqual(invoking, {
							method: pointerSymbolMap[symbol],
							args: {
								selector: 'body a'
							}
						});
					});
					// vm.on('loop-end', function () {
					// 	done();
					// });
					vm.run(genNode(symbol));
				});
			}

		});

		it('ACTION::INPUT', function () {
			const vm = new LCVM();
			vm.on('fetch', (rpc, invoking) => {
				assert.deepEqual(invoking, {
					method: 'doInput',
					args: {
						selector: 'body a',
						value: 'abc'
					}
				});
			});
			
			const node = new Statement.map['ACTION::INPUT']({
				BODY: {
					SYMBOL: 'ACTION::INPUT',
					SELECTOR: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 'body a'
						}
					},
					VALUE: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 'abc'
						}
					}
				}
			});
			vm.run(node);
		});

		it('upload', function () {

		});
	});
});
