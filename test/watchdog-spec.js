'use strict';
const assert = require('assert');
const Watchdog = require('../src/vm/watchdog.js');

const notThrow = assert.doesNotThrow;
let dog;
describe('watch dog test', () => {
	beforeEach(() => {
		dog = new Watchdog();
	});

	it('work()', () => {
		dog.work();
		dog.rest();
	});
});
