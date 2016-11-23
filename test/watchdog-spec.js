'use strict';
const assert = require('assert');
const {Watchdog} = require('../src/esvm/');

describe('Watchdog::', function () {
	this.timeout(2000);

	it('constructor', function () {
		const dog = new Watchdog();
		assert.equal(dog.cycle, 100);

		const dog2 = new Watchdog({cycle: 1000});
		assert.equal(dog2.cycle, 1000);
		assert.equal(dog2.lifeId, null);
	});

	it('work', function () {
		const dog = new Watchdog();
		dog.work(2000);
		assert.notEqual(dog.lifeId, null);
		assert.equal(dog.isWatching, false);
	});

	it('rest', function () {
		const dog = new Watchdog();
		dog.rest();
		assert.equal(dog.lifeId, null);
		assert.equal(dog.isWatching, false);
	});

	it('watch', function (done) {
		const dog = new Watchdog();
		assert.throws(function () {
			dog.watch();
		}, '[ESVM -> Watchdog::watch(limit,...)]: Invalid.');
		dog.work();

		var signal = false;
		dog.watch(100, function () {
			signal = true;
		});
		assert.notEqual(dog.lifeId, null);
		assert.equal(dog.isWatching, true);


		setTimeout(function () {
			assert.equal(signal, true);
			assert.equal(dog.isWatching, false);
			done();
		}, 1500);
	});

	it('cancelWatch', function () {
		const dog = new Watchdog();
		dog.work(2000);
		assert.notEqual(dog.lifeId, null);
		assert.equal(dog.isWatching, false);

		dog.rest();
		assert.equal(dog.lifeId, null);
	});
});
