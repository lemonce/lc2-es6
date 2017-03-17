const {parse, parseAt} = require('lc2-compiler/dist/bundle.js');
const {link, LCVM} = require('../src');
const assert = require('assert');

function codeTest(code, testFn) {
	const syntaxTree = parse(code);
	const executionTree = link(syntaxTree);
	const vm2 = new LCVM(executionTree);
	vm2.on('writeback', (err, ret) => {
		// console.log('WB', ret, err);
	});

	vm2.on('case-end', (...args) => {
		testFn(...args);
	});
	
	vm2.on('fetch', rpc => {
		rpc.async(() => {
			return new Promise(resolve => setTimeout(resolve, 1500));
		});
	});

	vm2.start();
}

describe('Sync::', function () {
	this.timeout(10000);

	it('process-call-return', function (done) {
		codeTest(`
process main () {
	test();

	click 'body a';
	return 2;
}

process test() {
	a = 1;
	if (a === 1) {
		return 5;
	}
}
		`, () => {
			done();
		});
	});

	it('while', function (done) {
		codeTest(`
process main () {
	index = 0;
	while(index < 5) {
		index += 1;
	}

	return index;
}
		`, vm => {
			assert.equal(vm.ret, 5);
			done();
		});
	});

	it('while-break', function (done) {
		codeTest(`
process main () {
	index = 0;
	while(index < 5) {
		index += 1;
		if (index === 3) {
			break;
		}
	}

	return index;
}
		`, vm => {
			assert.equal(vm.ret, 3);
			done();
		});

	});

	it('while-continue', function (done) {
		codeTest(`
process main () {
	index = 0;
	while(index < 5) {
		index += 1;
		continue;
		a = 'abc'; //19
	}

	return a;
}
		`, vm => {
			assert.equal(vm.ret, undefined);
			done();
		});

	});

	it('while-while-return', function (done) {
		codeTest(`
process main () {
	i = 0;
	j = 0;
	while(i < 5) {
		while (j < 2) {
			if (i === 3) {
				return 'success';
			}
			j += 1;
		}
		i += 1;
		j = 0;
	}

	return 'fail';
}
		`, vm => {
			assert.equal(vm.ret, 'success');
			done();
		});
	});

	it('[0, 1, 2]', function (done) {
		codeTest(`
process main () {
	return [0, 1, 2];
}
		`, vm => {
			assert.deepEqual(vm.ret, [0, 1, 2]);
			done();
		});
	});

	it('[0, b - a, 2]', function (done) {
		codeTest(`
process main () {
	a = 3;
	b = 4;

	return [0, b - a, 2];
}
		`, vm => {
			assert.deepEqual(vm.ret, [0, 1, 2]);
			done();
		});
	});

	it('[3, 4, 5][2]', function (done) {
		codeTest(`
process main () {
	return [3, 4, 5][2];
}
		`, vm => {
			assert.deepEqual(vm.ret, 5);
			done();
		});
	});

	it('[[0, 1, 2], 3, 4, 5]', function (done) {
		codeTest(`
process main () {
	return [[0, 1, 2], 3, 4, 5];
}
		`, vm => {
			assert.deepEqual(vm.ret, [[0, 1, 2], 3, 4, 5]);
			done();
		});
	});

	it('[3, [0, 1, 2], 4, 5][1][2]', function (done) {
		codeTest(`
process main () {
	return [3, [0, 1, 2], 4, 5][1][2];
}
		`, vm => {
			assert.equal(vm.ret, 2);
			done();
		});
	});

	it('Assign-Array-"a[0]=false', function (done) {
		codeTest(`
process main () {
	a = [];
	a[0] = false;
	return a;
}
		`, vm => {
			assert.deepEqual(vm.ret, [false]);
			done();
		});
	});

	it('for-of-[2 ,4, 5]-sum', function (done) {
		codeTest(`
process main () {
	sum = 0;
	for (item of [2, 4, 5]) {
		sum += item;
	}
	return sum;
}
		`, vm => {
			assert.equal(vm.ret, 11);
			done();
		});
	});

	it('for-in-[2 ,4, 5]-sum', function (done) {
		codeTest(`
process main () {
	sum = 0;
	array = [2, 4, 5];
	for (index in array) {
		sum += array[index];
	}
	return sum;
}
		`, vm => {
			assert.equal(vm.ret, 11);
			done();
		});
	});	

});