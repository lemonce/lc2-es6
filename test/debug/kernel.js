const {ESVM, Statement} = require('es-vm');

const test = new Statement();
test.execute = function* (vm, scope) {
	yield vm.flag = 1;
};
let kernel = new ESVM();

kernel.$runtime = test.doExecution(kernel, {});
kernel.$bootstrap();
kernel.$launch();

return;