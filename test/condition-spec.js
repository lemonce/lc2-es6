'use strict';
const {LCVM} = require('../src');
const {Statement, linkNode} = require('es-vm');
const assert = require('assert');

it('ES?:', function () {
	const vm = new LCVM();
	const node = linkNode({
		SYMBOL: 'ES?:',
		BODY: {
			CONDITION: {
				SYMBOL: 'LITERAL::SIMPLE',
				BODY: {
					DESTINATION: false
				}
			},
			TRUE: {
				SYMBOL: 'LITERAL::SIMPLE',
				BODY: {
					DESTINATION: 123
				}
			},
			FALSE: {
				SYMBOL: 'LITERAL::SIMPLE',
				BODY: {
					DESTINATION: 456
				}
			}
		}
	});

	assert.equal(456, vm.run(node));
});