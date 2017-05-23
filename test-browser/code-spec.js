const {parse} = require('lc2-compiler/dist/browser');
const assert = require('assert');
const {link, LCVM} = require('../dist/lc2-es6-vm.es5');

function codeTest(code, testFn) {
	const syntaxTree = parse(code);
	const executionTree = link(syntaxTree);
	const vm = new LCVM(executionTree);

	vm.on('case-end', (...args) => {
		testFn(...args);
	});

	vm.setOnFetch(() => {
		return new Promise(resolve => setTimeout(resolve, 1500));
	});
	
	vm.start();
}

describe('Only Sync Statement', function () {
	it('process-call-return', function (done) {
		codeTest(`
process main () {
	test();

	return 2;
}

process test() {
	a = 1;
	if (a === 1) {
		return 5;
	}
}
		`, (err, ret) => {
			assert.equal(ret, 2);
			done();
		});
	});
});