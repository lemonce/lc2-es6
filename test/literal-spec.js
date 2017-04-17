'use strict';
const {LCVM} = require('../src');
const {Statement, linkNode} = require('es-vm');
const assert = require('assert');

describe('LITERAL::',function () {
	const statementList = [
		{
			syntax: {
				SYMBOL: 'LITERAL::SIMPLE',
				BODY: {
					DESTINATION: 'test'
				}
			},
			ret: 'test'
		},
		{
			syntax: {
				SYMBOL: 'LITERAL::ARRAY',
				BODY: {
					LIST: [
						{
							SYMBOL: 'LITERAL::SIMPLE',
							BODY: {
								DESTINATION: 1
							}
						}
					]
				}
			},
			ret: [1]
		},
		{
			syntax: {
				SYMBOL: 'LITERAL::OBJECT',
				BODY: {
					LIST: [
						{
							SYMBOL: 'LITERAL::OBJECT::PROPERTY',
							BODY: {
								IDENTIFIER: 'a',
								VALUE: {
									SYMBOL: 'LITERAL::SIMPLE',
									BODY: {
										DESTINATION: 2
									}
								},
							}
						}
					]
				}
			},
			ret: { a: 2 }
		}
	];

	for(let node of statementList) {
		const {syntax, ret} = node;
		it(syntax.SYMBOL, function () {
			const vm = new LCVM();
			const statement = linkNode(syntax);

			assert.deepEqual(vm.run(statement), ret);
		});
	}
});