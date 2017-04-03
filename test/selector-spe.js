'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

it('Selector:: *', function (done) {
	const node = Statement.linkNode({
		BODY: {
			SYMBOL: 'LC<!',
			SELECTOR: {
				BODY: {
					SYMBOL: 'LITERAL::SIMPLE',
					DESTINATION: 'body a'
				}
			}
		}
	});

	blankVM.on('fetch', (rpc, invoking) => {
		assert.deepEqual(invoking, {
			method: 'isDisplay',
			args: {
				selector: 'body a'
			}
		});
		done();
	});

	blankVM.run(node);
});