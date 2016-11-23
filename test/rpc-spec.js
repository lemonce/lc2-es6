const {rpc} = require('../src/esvm');
const assert = require('assert');

describe('RPC::', function () {
	describe('Request::', function () {
		it('constructor -E', function () {
			const i = {};
			const a = new rpc.Request(i);
			assert.equal(a.invoking, i);
			assert.equal(a.$token, a.token);
		});
	});

	describe('Response::', function () {
		it('constructor -E', function () {
			return new rpc.Response(new rpc.Request({}));
		});
	});
});