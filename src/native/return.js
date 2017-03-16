const {Statement} = require('es-vm');

class ReturnStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.ret = this.$linkBySymbol(BODY.RET);
	}

	*execute (vm, scope) {
		yield* this.ret.doExecution(vm, scope);
		vm.writeback(null, vm.ret);

		yield 'PROCESS::RETURN';
	}
}

ReturnStatement.register('RETURN');
