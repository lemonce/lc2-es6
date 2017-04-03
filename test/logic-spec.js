'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe('LOGIC::', function () {
	const vm = new LCVM();

	it('ES|| @0||a=1;', function () {
		const test = Statement.linkNode({
			BODY: {
				SYMBOL: 'ES||',
				LEFT: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 0
					}
				},
				RIGHT: {
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
				}
			}
		});

		assert.equal(vm.run(test), 1);
		assert.equal(vm.rootScope.a, 1);
	});

	it('ES|| @1||a=2;', function () {
		const test = Statement.linkNode({
			BODY: {
				SYMBOL: 'ES||',
				LEFT: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 0
					}
				},
				RIGHT: {
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
				}
			}
		});

		assert.equal(vm.run(test), true);
		assert.notEqual(vm.rootScope.a, 2);
	});

	it('ES&& @0&&a=1;', function () {
		const test = Statement.linkNode({
			BODY: {
				SYMBOL: 'ES&&',
				LEFT: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 0
					}
				},
				RIGHT: {
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
				}
			}
		});

		assert.equal(vm.run(test), false);
		assert.equal(vm.rootScope.a, 1);
	});

	it('ES&& @1&&a=2;', function () {
		const test = Statement.linkNode({
			BODY: {
				SYMBOL: 'ES&&',
				LEFT: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 1
					}
				},
				RIGHT: {
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
								DESTINATION: 2
							}
						}
					}
				}
			}
		});

		assert.equal(vm.run(test), 2);
		assert.equal(vm.rootScope.a, 2);
	});

	it('ES! @!0;', function () {
		const test = Statement.linkNode({
			BODY: {
				SYMBOL: 'ES!',
				SOURCES: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 0
					}
				}
			}
		});

		assert.equal(vm.run(test), true);
	});
});