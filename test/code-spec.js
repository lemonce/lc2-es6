const {parse, parseAt} = require('lc2-compiler');
const {link, LCVM} = require('../src');
const assert = require('assert');

function codeTest(code, testFn) {
	const syntaxTree = parse(code);
	const executionTree = link(syntaxTree);
	const vm = new LCVM(executionTree);

	vm.on('case-end', (...args) => {
		testFn(...args);
	});
	
	vm.on('fetch', rpc => {
		rpc.async(() => {
			return new Promise(resolve => setTimeout(resolve, 1500));
		});
	});

	vm.start();
}

describe('Testing with compiler::', function () {
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
			`, vm => {
				assert.equal(vm.rootScope['<CHILD_RETURN>'], 2);
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
				assert.equal(vm.rootScope['<CHILD_RETURN>'], 5);
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
				assert.equal(vm.rootScope['<CHILD_RETURN>'], 3);
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
				assert.equal(vm.rootScope['<CHILD_RETURN>'], undefined);
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
				assert.equal(vm.rootScope['<CHILD_RETURN>'], 'success');
				done();
			});
		});

		it('[0, 1, 2]', function (done) {
			codeTest(`
process main () {
	return [0, 1, 2];
}
			`, vm => {
				assert.deepEqual(vm.rootScope['<CHILD_RETURN>'], [0, 1, 2]);
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
				assert.deepEqual(vm.rootScope['<CHILD_RETURN>'], [0, 1, 2]);
				done();
			});
		});

		it('[3, 4, 5][2]', function (done) {
			codeTest(`
process main () {
	return [3, 4, 5][2];
}
			`, vm => {
				assert.deepEqual(vm.rootScope['<CHILD_RETURN>'], 5);
				done();
			});
		});

		it('[[0, 1, 2], 3, 4, 5]', function (done) {
			codeTest(`
process main () {
	return [[0, 1, 2], 3, 4, 5];
}
			`, vm => {
				assert.deepEqual(vm.rootScope['<CHILD_RETURN>'], [[0, 1, 2], 3, 4, 5]);
				done();
			});
		});

		it('[3, [0, 1, 2], 4, 5][1][2]', function (done) {
			codeTest(`
process main () {
	return [3, [0, 1, 2], 4, 5][1][2];
}
			`, vm => {
				assert.equal(vm.rootScope['<CHILD_RETURN>'], 2);
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
				assert.deepEqual(vm.rootScope['<CHILD_RETURN>'], [false]);
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
				assert.equal(vm.rootScope['<CHILD_RETURN>'], 11);
				done();
			});
		});

		it('{a: 1, b:2}', function (done) {
			codeTest(`
process main () {
	return {a:1, b:2};
}
			`, vm => {
				assert.deepEqual(vm.rootScope['<CHILD_RETURN>'], {a: 1, b:2});
				done();
			});
		});

		it('simulate-data', function (done) {
			codeTest(`
process main () {
	data = {
		a: 1,
		b: 2,
		list: [3, 4, 5]
	};

	data.list[1] = false;
	return data;
}
			`, vm => {
				assert.deepEqual(vm.rootScope['<CHILD_RETURN>'], {
					a: 1,
					b: 2,
					list: [3, false, 5]
				});
				done();
			});
		});

		it('object-for-sum', function (done) {
			codeTest(`
process main () {
	data = {
		a: 1,
		b: 2,
		c: 3
	};

	keystr = '';
	sum = 0;

	for(key in data) {
		keystr += key;
		sum += data[key];
	}

	return keystr + sum;
}
			`, vm => {
				assert.equal(vm.rootScope['<CHILD_RETURN>'], 'abc6');
				done();
			});

		});
	});


});