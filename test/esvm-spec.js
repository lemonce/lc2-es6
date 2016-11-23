const {Kernel} = require('../src/esvm/kernel');
const Statement = require('../src/esvm/statement');
const assert = require('assert');
const {Response} = require('../src/esvm/rpc');

describe('ESVM::', function () {
	describe('Kernel::', function () {
		const statement = new Statement();
		statement.execute = function* (vm) {
			yield vm.flag = 1;
		};

		it('constructor -E', function () {
			new Kernel();
		});

		describe('bootstrap::', function () {
			const vk = new Kernel();
			const event = {
				'bootstrap-start': false,
				'bootstrap-end': false,
			};

			vk.on('bootstrap-start', function (vm) {
				event['bootstrap-start'] = true;
				assert.equal(vm, vk);
			});

			vk.on('bootstrap-end', function (vm) {
				event['bootstrap-end'] = true;
				assert.equal(vm, vk);
			});

			it('signal#IDEL -E', function () {
				vk.$bootstrap();
				assert.notEqual(vk.$watchdog.lifeId, null);
				assert.equal(event['bootstrap-start'], true);
				assert.equal(event['bootstrap-end'], true);
			});

			it('signal#BOOTING +E', function () {
				assert.throws(() => {
					vk.$bootstrap();
				}, '[ESVM]: VM must boot from signal:IDLE.');
			});
		});

		describe('lanuch::', function () {
			const vk = new Kernel();
			vk.$bootstrap();

			it('No-program +E', function () {
				assert.throws(() => {
					vk.$lanuch();
				}, '[ESVM]: No-program in vm.');
			});

			it('Invalid signal +E', function () {
				const vk = new Kernel();
				assert.throws(() => {
					vk.loadProgram(statement);
					vk.$lanuch();
				}, /\[ESVM\]: Can not \$lanuch vm from signal/);
			});

			it('normal -E', function () {
				vk.loadProgram(statement);
				vk.$lanuch();
				assert.equal(vk.flag, 1);
			});

			it('intercept by statement', function (done) {
				const vk = new Kernel();
				vk.$bootstrap();

				const is = new Statement();
				is.execute = function* (vm) {
					yield vm.p1 = 1;
					yield vm.$block();
					yield vm.p2 = 2;
				};

				vk.loadProgram(is);
				vk.$lanuch();

				assert.equal(vk.p1, 1);
				assert.equal(vk.p2, undefined);

				vk.on('program-end', function () {
					done();
				});
				vk.$run();
				assert.equal(vk.p2, 2);
			});
		});

		describe('writeback::', function () {
			const program = new Statement();
			const mockPos = {};
			program.position = mockPos;
			program.execute = function* (vm) {
				yield vm.p1 = 'start';
				yield vm.writeback(null, 123);
			};

			it('normal -E', function (done) {
				const vk = new Kernel();
				vk.$bootstrap();
				vk.loadProgram(program);
				vk.on('writeback', (err, ret, pos) => {
					assert.equal(err, null);
					assert.equal(ret, 123);
					assert.equal(pos, mockPos);
					done();
				});
				vk.$lanuch();
				assert.equal('start', vk.p1);
			});

			it('error +E', function (done) {
				const program = new Statement();
				const mockPos = {};
				program.position = mockPos;
				program.execute = function* (vm) {
					yield vm.p1 = 'start';
					yield vm.writeback(new Error('abc'), 123);
				};
				const vk = new Kernel();
				vk.$bootstrap();
				vk.loadProgram(program);
				vk.on('error', err => {
					assert.equal(err.message, 'abc');
					done();
				});
				vk.$lanuch();
				assert.equal('start', vk.p1);
			});
		});

		describe('RPC::', function () {
			const program = new Statement();
			const content = {};
			program.execute = function* (vm) {
				yield vm.p1 = 'start';
				yield vm.fetch(content);
				yield vm.writeback(null, 123);
			};
			it('fetch', function (done) {
				const vk = new Kernel();
				vk.on('fetch', (req, vm) => {
					assert.equal(req.invoking, content);
					assert.equal(vm, vk);
				});

				vk.on('error', err => {
					assert.notEqual(err, null);
				});

				vk.on('writeback', () => {
					assert.equal(vk.ret, 1);
					done();
				});

				vk.$bootstrap();
				vk.loadProgram(program);
				vk.$lanuch();
			});

			describe('respond::', function () {
				const program = new Statement();
				const content = {};
				program.execute = function* (vm) {
					yield vm.p1 = 'start';
					yield vm.fetch(content, 500);
					yield vm.writeback(null, 123);
				};

				it('Async response', function (done) {
					const vk = new Kernel();
					vk.on('fetch', (req, vm) => {
						assert.equal(req.invoking, content);
						assert.equal(vm, vk);
						setTimeout(() => {
							vk.respond(new Response(req, null, 123));
						}, 350);
					});

					vk.on('writeback', () => {
						assert.equal(vk.ret, 123);
						done();
					});

					vk.$bootstrap();
					vk.loadProgram(program);
					vk.$lanuch();
				});

				it('Sync response', function (done) {
					const vk = new Kernel();
					vk.on('fetch', (req, vm) => {
						assert.equal(req.invoking, content);
						assert.equal(vm, vk);
						vk.respond(new Response(req, null, 123));
					});

					vk.on('writeback', () => {
						assert.equal(vk.ret, 123);
						done();
					});

					vk.$bootstrap();
					vk.loadProgram(program);
					vk.$lanuch();
				});
			});

		});
	})
});