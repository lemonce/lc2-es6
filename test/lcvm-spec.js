const LCVMKernel = require('../src/vm/kernel');
const assert = require('assert');

describe('LCVMKernel', function () {
	describe('constructor', function () {
		it('It should be build without exception', function () {
			assert.equal((new LCVMKernel()) instanceof LCVMKernel, true);
		});
	});
	
	

});