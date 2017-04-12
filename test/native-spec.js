'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe('NATIVE::', function () {
	describe('CALL', function () {
		it('call a native process', function () {
			const vm = new LCVM();
			const call = Statement.linkNode({
				SYMBOL: 'CALL',
				BODY: {
					IDENTIFIER: 'random',
					ARGUMENTS: [{
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: /\d{4}/
						}
					}]
				}
			});

			assert.equal(/\d{4}/.test(vm.run(call)), true);
		});

		it('call a custom process');
	});

	it('LOG', function (done) {
		const vm = new LCVM();
		const wait = Statement.linkNode({
			SYMBOL: 'LOG',
			BODY: {
				LOG: {
					SYMBOL: 'LITERAL::SIMPLE',
					BODY: {
						DESTINATION: 4
					}
				}
			}
		});

		let logCount = 0;
		vm.on('driver', ({type, data}) => {
			assert.equal(type, 'log');
			assert.equal(data.content, 4);
			logCount++;
		});

		vm.on('program-end', function () {
			assert(logCount, 1);
			done();
		});

		vm.run(wait);
	});

	describe('WAIT::', function () {
		it('can block the following statement', function (done) {
			const vm = new LCVM();
			const wait = Statement.linkNode({
				SYMBOL: 'WAIT',
				BODY: {
					DELAY: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: '300'
						}
					}
				}
			});

			const startTime = Date.now();

			vm.on('program-end', function () {
				const realDelay = Date.now() - startTime;
				assert.equal(realDelay - 300 < 30, true);
				done();
			});

			vm.run(wait);
		});

		it('can stop by $halt', function (done) {
			let eventEmited = false;
			const vm = new LCVM();
			const wait = Statement.linkNode({
				SYMBOL: 'WAIT',
				BODY: {
					DELAY: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: '300'
						}
					}
				}
			});

			vm.on('program-end', function () {
				eventEmited = true;
			});

			vm.run(wait);

			setTimeout(() => {
				vm.$halt();
			}, 200);

			setTimeout(() => {
				assert.equal(eventEmited, false);
				done();
			}, 400);
		});
	});

	describe('ASSERT::', function () {
		it('return true when success', function () {
			const vm = new LCVM();
			const assertStatement = Statement.linkNode({
				SYMBOL: 'ASSERT',
				BODY: {
					TEST: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 1
						}
					}
				}
			});

			assert.equal(vm.run(assertStatement), true);
		});

		it('throw error when fail in default limit.', function (done) {
			const vm = new LCVM();
			const assertStatement = Statement.linkNode({
				SYMBOL: 'ASSERT',
				BODY: {
					TEST: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 0
						}
					}
				}
			});

			vm.on('error', function (err) {
				assert.equal(err.message, '[LCVM]: Assertion Failure.');
				done();
			});

			vm.run(assertStatement);
		});

		it('throw error when fail in assigned limit. 1000ms', function (done) {
			const vm = new LCVM();
			const assertStatement = Statement.linkNode({
				SYMBOL: 'ASSERT',
				BODY: {
					TEST: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 0
						}
					},
					LIMIT: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 1000
						}
					}
				}
			});

			vm.on('error', function (err) {
				assert.equal(err.message, '[LCVM]: Assertion Failure.');
				done();
			});

			vm.run(assertStatement);
		});

		it('test success at 300ms', function (done) {
			const vm = new LCVM();
			const assertStatement = Statement.linkNode({
				SYMBOL: 'ASSERT',
				BODY: {
					TEST: {
						SYMBOL: 'ACCESS::VARIABLE',
						BODY: {
							IDENTIFIER: 'a'
						}
					}
				}
			});

			vm.run(assertStatement);

			setTimeout(() => {
				vm.rootScope.a = true;
			}, 300);

			setTimeout(() => {
				assert.notEqual(vm.$runtime, null);
			}, 250);

			setTimeout(() => {
				assert.equal(vm.$runtime, null);
				done();
			}, 350);
		});

		it('halt when testing at 500ms', function (done) {
			const vm = new LCVM();
			const assertStatement = Statement.linkNode({
				SYMBOL: 'ASSERT',
				BODY: {
					TEST: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 0
						}
					},
					LIMIT: {
						SYMBOL: 'LITERAL::SIMPLE',
						BODY: {
							DESTINATION: 1000
						}
					}
				}
			});

			vm.run(assertStatement);

			setTimeout(() => vm.$halt(), 500);

			setTimeout(() => {
				assert.equal(vm.$runtime, null);
				done();
			}, 800);
		});
	});
});