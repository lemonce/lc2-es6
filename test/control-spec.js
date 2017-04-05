'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe('CONTROL::', function () {
	it('LOOP::WHILE', function () {
		const vm = new LCVM();
		const scope = { index: 0 };
		const node = Statement.linkNode({
			BODY: {
				SYMBOL: 'LOOP::WHILE',
				CONDITION: {
					BODY: {
						SYMBOL: 'ES<',
						LEFT: {
							BODY: {
								SYMBOL: 'ACCESS::VARIABLE',
								IDENTIFIER: 'index'
							}
						},
						RIGHT: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 5
							}
						}
					}
				},
				SEGMENT: [
					{
						BODY: {
							SYMBOL: 'ES+=',
							LEFT: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'index'
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
				]
			}
		});

		vm.run(node, scope);
		assert.equal(vm.rootScope.index, 5);
	});
	
	it('BRANCH', function () {
		const vm = new LCVM();
		const node =  Statement.linkNode({
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
							SYMBOL: 'ES=',
							LEFT: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'ret'
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
									DESTINATION: 'abc'
								}
							}
						}
					}
				],
				SEGMENT_FALSE: [
					{
						BODY: {
							SYMBOL: 'ES=',
							LEFT: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'ret'
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'LITERAL::SIMPLE',
									DESTINATION: 'def'
								}
							}
						}
					}
				]
			}
		});
		vm.run(node);
		assert.equal(vm.rootScope.ret, 'def');
	});

	it('PROCESS', function () {
		const vm = new LCVM();
		const process = Statement.linkNode({
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
		});
		vm.run(process);
		assert.equal(vm.rootScope['<RETURN>'], 'xyz');
	});
});