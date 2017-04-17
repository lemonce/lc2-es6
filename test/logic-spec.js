'use strict';
const {LCVM} = require('../src');
const {Statement, linkNode} = require('es-vm');
const assert = require('assert');

describe('LOGIC::', function () {
	const vm = new LCVM();

	it('ES|| @0||a=1;', function () {
		const test = linkNode({
			SYMBOL: 'ES||',
			BODY: {
				LEFT: {
					SYMBOL: 'LITERAL::SIMPLE',
					BODY: {
						DESTINATION: 0
					}
				},
				RIGHT: {
					SYMBOL: 'ES=',
					BODY: {
						LEFT: {
							SYMBOL: 'ACCESS::VARIABLE',
							BODY: {
								IDENTIFIER: 'a'
							}
						},
						RIGHT: {
							SYMBOL: 'LITERAL::SIMPLE',
							BODY: {
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
		const test = linkNode({
			SYMBOL: 'ES||',
			BODY: {
				LEFT: {
					SYMBOL: 'LITERAL::SIMPLE',
					BODY: {
						DESTINATION: 0
					}
				},
				RIGHT: {
					SYMBOL: 'ES=',
					BODY: {
						LEFT: {
							SYMBOL: 'ACCESS::VARIABLE',
							BODY: {
								IDENTIFIER: 'a'
							}
						},
						RIGHT: {
							SYMBOL: 'LITERAL::SIMPLE',
							BODY: {
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
		const test = linkNode({
			SYMBOL: 'ES&&',
			BODY: {
				LEFT: {
					SYMBOL: 'LITERAL::SIMPLE',
					BODY: {
						DESTINATION: 0
					}
				},
				RIGHT: {
					SYMBOL: 'ES=',
					BODY: {
						LEFT: {
							SYMBOL: 'ACCESS::VARIABLE',
							BODY: {
								IDENTIFIER: 'a'
							}
						},
						RIGHT: {
							SYMBOL: 'LITERAL::SIMPLE',
							BODY: {
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
		const test = linkNode({
			SYMBOL: 'ES&&',
			BODY: {
				LEFT: {
					SYMBOL: 'LITERAL::SIMPLE',
					BODY: {
						DESTINATION: 1
					}
				},
				RIGHT: {
					SYMBOL: 'ES=',
					BODY: {
						LEFT: {
							SYMBOL: 'ACCESS::VARIABLE',
							BODY: {
								IDENTIFIER: 'a'
							}
						},
						RIGHT: {
							SYMBOL: 'LITERAL::SIMPLE',
							BODY: {
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
		const test = linkNode({
			SYMBOL: 'ES!',
			BODY: {
				SOURCES: {
					SYMBOL: 'LITERAL::SIMPLE',
					BODY: {
						DESTINATION: 0
					}
				}
			}
		});

		assert.equal(vm.run(test), true);
	});
});