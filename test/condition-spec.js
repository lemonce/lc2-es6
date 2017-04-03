'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

it('ES?:', function () {
	const vm = new LCVM();
	const node = Statement.linkNode({
		BODY: {
			SYMBOL: 'ES?:',
			CONDITION: {
				BODY: {
					SYMBOL: 'LITERAL::SIMPLE',
					DESTINATION: false
				}
			},
			TRUE: {
				BODY: {
					SYMBOL: 'LITERAL::SIMPLE',
					DESTINATION: 123
				}
			},
			FALSE: {
				BODY: {
					SYMBOL: 'LITERAL::SIMPLE',
					DESTINATION: 456
				}
			}
		}
	});

	assert.equal(456, vm.run(node));
});