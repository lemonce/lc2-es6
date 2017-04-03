'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe('LITERAL::',function () {
	const statementList = [
		{
			syntax: {
				BODY: {
					SYMBOL: 'LITERAL::SIMPLE',
					DESTINATION: 'test'
				}
			},
			ret: 'test'
		},
		{
			syntax: {
				BODY: {
					SYMBOL: 'LITERAL::ARRAY',
					LIST: [
						{
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
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
				BODY: {
					SYMBOL: 'LITERAL::OBJECT',
					LIST: [
						{
							BODY: {
								SYMBOL: 'LITERAL::OBJECT::PROPERTY',
								IDENTIFIER: 'a',
								VALUE: {
									BODY: {
										SYMBOL: 'LITERAL::SIMPLE',
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
		it(syntax.BODY.SYMBOL, function () {
			const vm = new LCVM();
			const statement = Statement.linkNode(syntax);

			assert.deepEqual(vm.run(statement), ret);
		});
	}
});