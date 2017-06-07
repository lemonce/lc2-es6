'use strict';
const {LCVM} = require('../src');
const {linkNode} = require('es-vm');
const assert = require('assert');

describe('DRIVER::', function () {
	describe('BROWSER::', function () {
		it('BACK', function (done) {
			const blankVM = new LCVM();
			const node = linkNode({
				SYMBOL: 'BROWSER::BACK',
				BODY: {
				}
			});

			blankVM.setOnFetch(invoking => {
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
			const node = linkNode({
				SYMBOL: 'BROWSER::FORWARD',
				BODY: {}
			});

			blankVM.setOnFetch(invoking => {
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
			const node = linkNode({
				SYMBOL: 'BROWSER::REFRESH',
				BODY: {}
			});

			blankVM.setOnFetch(invoking => {
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
			const node = new linkNode({
				SYMBOL: 'BROWSER::JUMPTO',
				BODY: {
					URL: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 'http://baidu.com'
						}
					}
				}
			});

			blankVM.setOnFetch(invoking => {
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
		this.timeout(10000);

		const pointerSymbolMap = {
			'ACTION::CLICK': 'doClick',
			'ACTION::DBLCLICK': 'doDblclick',
			'ACTION::DROP': 'doDrop',
			'ACTION::HOLD': 'doHold',
			'ACTION::SCROLL': 'doScroll',
			'ACTION::MOVE': 'doMove'
		};

		function genNode(symbol) {
			return linkNode({
				SYMBOL: symbol,
				BODY: {
					SELECTOR: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 'body a'
						}
					}
				}
			});
		}

		for(let symbol in pointerSymbolMap) {
			it(symbol, function (done) {
				const vm = new LCVM();
				vm.setOnFetch(invoking => {
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
		
		it('click with error', function (done) {
			const vm = new LCVM();
			vm.setOnFetch(invoking => {
				assert.deepEqual(invoking, {
					method: pointerSymbolMap['ACTION::CLICK'],
					args: {
						button: 'left',
						selector: 'body a'
					}
				});

				throw null;
			});

			vm.on('program-end', exception => {
				assert.equal(exception.message, 'Driver action request failed.');

				done();
			});
			
			vm.run(genNode('ACTION::CLICK'));
		});

		const keyboardSymbolMap = {
			'ACTION::KEYDOWN': 'doKeydown',
			'ACTION::KEYUP': 'doKeyup',
			'ACTION::KEYPRESS': 'doKeypress'
		};

		function genKeyboardNode(symbol) {
			return linkNode({
				SYMBOL: symbol,
				BODY: {
					KEY_EXPR: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 'Enter'
						}
					}
				}
			});
		}

		for(let symbol in keyboardSymbolMap) {
			it(symbol, function (done) {
				const vm = new LCVM();
				vm.setOnFetch(invoking => {
					assert.deepEqual(invoking, {
						method: keyboardSymbolMap[symbol],
						args: {code: 'Enter'}
					});

					done();
				});
				
				vm.run(genKeyboardNode(symbol));
			});
		}

		it('ACTION::INPUT', function (done) {
			const vm = new LCVM();
			vm.setOnFetch(invoking => {
				assert.deepEqual(invoking, {
					method: 'doInput',
					args: {
						selector: 'body a',
						value: 'abc'
					}
				});
				done();
			});
			
			const node = linkNode({
				SYMBOL: 'ACTION::INPUT',
				BODY: {
					SELECTOR: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 'body a'
						}
					},
					VALUE: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
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
				const upload = linkNode({
					SYMBOL: 'ACTION::UPLOAD',
					BODY: {
						FILE_LIST: {
							SYMBOL: 'LITERAL::ARRAY',
							BODY: {
								LIST: [
									{
										SYMBOL: 'LITERAL::SIMPLE',
										BODY: {
											DESTINATION: 'jpg'
										}
									},
									{
										SYMBOL: 'LITERAL::SIMPLE',
										BODY: {
											DESTINATION: 'png'
										}
									}
								]
							}
						}
					}
				});

				vm.setOnFetch(invoking => {
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
				const upload = linkNode({
					SYMBOL: 'ACTION::UPLOAD',
					BODY: {
						FILE_LIST: {
							SYMBOL: 'LITERAL::SIMPLE',
							BODY: {
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
				const node = linkNode({
					SYMBOL: OP,
					BODY: {
						SELECTOR: {
							SYMBOL: 'LITERAL::SIMPLE',
							BODY: {
								DESTINATION: 'body a'
							}
						}
					}
				});

				vm.setOnFetch(invoking => {
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