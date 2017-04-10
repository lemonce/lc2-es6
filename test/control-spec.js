'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe('CONTROL::', function () {
	it('LOOP::WHILE', function () {
		const vm = new LCVM();
		const scope = { index: 0 };
		const node = Statement.linkNode({
			SYMBOL: 'LOOP::WHILE',
			BODY: {
				CONDITION: {
					SYMBOL: 'ES<',
					BODY: {
						LEFT: {
							SYMBOL: 'ACCESS::VARIABLE',
							BODY: {
								IDENTIFIER: 'index'
							}
						},
						RIGHT: {
							SYMBOL: 'LITERAL::SIMPLE',
							BODY: {
								DESTINATION: 5
							}
						}
					}
				},
				SEGMENT: [
					{
						SYMBOL: 'ES+=',
						BODY: {
							LEFT: {
								SYMBOL: 'ACCESS::VARIABLE',
								BODY: {
									IDENTIFIER: 'index'
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
				]
			}
		});

		vm.run(node, scope);
		assert.equal(vm.rootScope.index, 5);
	});
	
	it('BRANCH', function () {
		const vm = new LCVM();
		const node =  Statement.linkNode({
			SYMBOL: 'BRANCH',
			BODY: {
				CONDITION: {
					SYMBOL: 'LITERAL::SIMPLE',
					BODY: {
						DESTINATION: false
					}
				},
				SEGMENT_TRUE: [
					{
						SYMBOL: 'ES=',
						BODY: {
							LEFT: {
								SYMBOL: 'ACCESS::VARIABLE',
								BODY: {
									IDENTIFIER: 'ret'
								}
							},
							RIGHT: {
								SYMBOL: 'LITERAL::SIMPLE',
								BODY: {
									DESTINATION: 'abc'
								}
							}
						}
					}
				],
				SEGMENT_FALSE: [
					{
						SYMBOL: 'ES=',
						BODY: {
							LEFT: {
								SYMBOL: 'ACCESS::VARIABLE',
								BODY: {
									IDENTIFIER: 'ret'
								}
							},
							RIGHT: {
								SYMBOL: 'LITERAL::SIMPLE',
								BODY: {
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
			SYMBOL: 'PROCESS',
			BODY: {
				IDENTIFIER: 'main',
				PARAMETER: [],
				SEGMENT: [
					{
						SYMBOL: 'RETURN',
						BODY: {
							RET: {
								SYMBOL: 'LITERAL::SIMPLE',
								BODY: {
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