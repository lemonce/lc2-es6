'use strict';
const {link, LCVM} = require('../src');
const {Statement, signal} = require('es-vm');
const assert = require('assert');

const blankVM = new LCVM();
describe('Statement::', function () {

	describe('Control::', function () {
		it('while {...}', function () {
			const node = new Statement.map['LOOP::WHILE']({
				BODY: {
					SYMBOL: 'LOOP::WHILE',
					CONDITION: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: false
						}
					},
					SEGMENT: [
						{
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: true
							}
						}
					]
				}
			});
			var index = 0;
			blankVM.on('[loop]', vm => {
				index++;
				if (index < 5) {
					vm.ret = true;
				}
			});
			blankVM.run(node);
			assert.equal(index, 5);
		});
		
		it('if {...} else {...}', function () {
			const node =  new Statement.map['BRANCH']({
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
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'abc'
							}
						}
					],
					SEGMENT_FALSE: [
						{
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 'def'
							}
						}
					]
				}
			});
			let $ret = blankVM.run(node);
			assert.equal($ret, 'def');
		});

		it('process () {...} | call | return', function () {
			const process = {
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
			};
			const vm = new LCVM(link([process]));
			
			vm.on('loop-end', vm => {
				assert.equal(vm.ret, 'xyz');
			});
			assert.equal(vm.ret, null);
		});
	});

});
