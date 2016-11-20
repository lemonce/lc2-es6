const {link, Statement} = require('../src/linker');
const LCVMKernel = require('../src/vm/kernel');
const assert = require('assert');

const blankVM = new LCVMKernel();
describe('Statement::', function () {
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
});