const {parse} = require('lc2-compiler');
const {link, LCVM} = require('../src');
const assert = require('assert');

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
			`, (err, ret) => {
				assert.equal(ret, 2);
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
			`, (err, ret) => {
				assert.equal(ret, 5);
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
			`, (err, ret) => {
				assert.equal(ret, 3);
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
			`, (err, ret) => {
				assert.equal(ret, undefined);
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
			`, (err, ret) => {
				assert.equal(ret, 'success');
				done();
			});
		});

		it('[0, 1, 2]', function (done) {
			codeTest(`
process main () {
	return [0, 1, 2];
}
			`, (err, ret) => {
				assert.deepEqual(ret, [0, 1, 2]);
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
			`, (err, ret) => {
				assert.deepEqual(ret, [0, 1, 2]);
				done();
			});
		});

		it('[3, 4, 5][2]', function (done) {
			codeTest(`
process main () {
	return [3, 4, 5][2];
}
			`, (err, ret) => {
				assert.deepEqual(ret, 5);
				done();
			});
		});

		it('[[0, 1, 2], 3, 4, 5]', function (done) {
			codeTest(`
process main () {
	return [[0, 1, 2], 3, 4, 5];
}
			`, (err, ret) => {
				assert.deepEqual(ret, [[0, 1, 2], 3, 4, 5]);
				done();
			});
		});

		it('[3, [0, 1, 2], 4, 5][1][2]', function (done) {
			codeTest(`
process main () {
	return [3, [0, 1, 2], 4, 5][1][2];
}
			`, (err, ret) => {
				assert.equal(ret, 2);
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
			`, (err, ret) => {
				assert.deepEqual(ret, [false]);
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
			`, (err, ret) => {
				assert.equal(ret, 11);
				done();
			});
		});

		it('{a: 1, b:2}', function (done) {
			codeTest(`
process main () {
	return {a:1, b:2};
}
			`, (err, ret) => {
				assert.deepEqual(ret, {a: 1, b:2});
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
			`, (err, ret) => {
				assert.deepEqual(ret, {
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
			`, (err, ret) => {
				assert.equal(ret, 'abc6');
				done();
			});

		});
	});


});