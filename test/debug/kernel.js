const {Kernel} = require('../../src/esvm/kernel');
const Statement = require('../../src/esvm/statement');

const test = new Statement();
test.execute = function* (vm, scope) {
	yield vm.flag = 1;
};
let kernel = new Kernel();

kernel.$runtime = test.doExecution(kernel, {});
kernel.$bootstrap();
kernel.$lanuch();

return;