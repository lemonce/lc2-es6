const {Scope} = require('../src/esvm/scope');
const assert = require('assert');

describe('Scope::', function () {
	it('constructor', function () {
		return new Scope();
	});

	it('new child', function () {
		const root = new Scope({
			global: 123
		});
		const child = root.$new({
			$: 456
		});
		assert.equal(child === root, false);
		assert.equal(child.global, 123);
		assert.equal(child.$, 456);
		assert.equal(root.global, 123);
		assert.equal(root.$, undefined);
	});

	it('extend', function () {
		const root = new Scope({
			global: 123
		});
		const child = root.$new({
			$: 456
		});

		child.extend({ a: 1, b: 2, c: 3 });
		
		assert.equal(child.a, 1);
		assert.equal(child.b, 2);
		assert.equal(child.c, 3);
	});
});