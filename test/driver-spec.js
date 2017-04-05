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
			it(symbol, function (done) {
				const vm = new LCVM();
				vm.on('fetch', (rpc, invoking) =>  {
					if (invoking.method === 'doDrop') {
						assert.deepEqual(invoking, {
							method: 'doDrop',
							args: {}
						});

						done();
						return;
					}

					assert.deepEqual(invoking, {
						method: pointerSymbolMap[symbol],
						args: {
							button: 'left',
							selector: 'body a'
						}
					});

					done();
				});
				
				vm.run(genNode(symbol));
			});
		}

		it('ACTION::INPUT', function (done) {
			const vm = new LCVM();
			vm.on('fetch', (rpc, invoking) => {
				assert.deepEqual(invoking, {
					method: 'doInput',
					args: {
						selector: 'body a',
						value: 'abc'
					}
				});
				done();
			});
			
			const node = Statement.linkNode({
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

		describe('UPLOAD', function () {
			it('success with correct file list arguments.', function (done) {
				const vm = new LCVM();
				const upload = Statement.linkNode({
					BODY: {
						SYMBOL: 'ACTION::UPLOAD',
						FILE_LIST: {
							BODY: {
								SYMBOL: 'LITERAL::ARRAY',
								LIST: [
									{
										BODY: {
											SYMBOL: 'LITERAL::SIMPLE',
											DESTINATION: 'jpg'
										}
									},
									{
										BODY: {
											SYMBOL: 'LITERAL::SIMPLE',
											DESTINATION: 'png'
										}
									}
								]
							}
						}
					}
				});

				vm.on('fetch', (rpc, invoking) => {
					assert.deepEqual(invoking, {
						method: 'doUpload',
						args: {
							fileList: ['jpg', 'png']
						}
					});
					done();
				});

				vm.run(upload);
			});

			it('fail with incorrect file list.', function (done) {
				const vm = new LCVM();
				const upload = Statement.linkNode({
					BODY: {
						SYMBOL: 'ACTION::UPLOAD',
						FILE_LIST: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'jpg'
							}
						}
					}
				});

				vm.on('error', err => {
					assert.equal(err.message, '[LCVM]: Upload statement except [<string>,...].');
					done();
				});

				vm.run(upload);
			});

		});
	});

	describe('SELECTOR::', function () {
		const selectorList = {
			'LC<!': 'isDisplay',
			'LC<#': 'getLength',
			'LC<@': 'getText',
			'LC<-': 'getWidth',
			'LC<|': 'getHeigth',
			'LC<<': 'getLeft',
			'LC<^': 'getTop',
		};

		for(let OP in selectorList) {
			it(OP, function (done) {
				const vm = new LCVM();
				const node = Statement.linkNode({
					BODY: {
						SYMBOL: OP,
						SELECTOR: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'body a'
							}
						}
					}
				});

				vm.on('fetch', (rpc, invoking) => {
					assert.deepEqual(invoking, {
						method: selectorList[OP],
						args: { selector: 'body a' }
					});
					done();
				});

				vm.run(node);
			});
		}
	});
});