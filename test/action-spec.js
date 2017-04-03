'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe('DRIVER::', function () {
	describe('BROWSER::', function () {
		it('BACK', function (done) {
			const blankVM = new LCVM();
			const node = Statement.linkNode({
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
			const node = Statement.linkNode({
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
			const node = Statement.linkNode({
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
			const node = new Statement.linkNode({
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

		it('resize');
	});

	describe('ACTION::', function () {
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
			return Statement.linkNode({
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
							button: 'left',
							selector: 'body a'
						}
					});
				});
				
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

	it('upload');
});