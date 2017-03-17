const ControlStatement = require('../control');
const {Statement} = require('es-vm');

class ProcessStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.parameter = Array.from(BODY.PARAMETER);

		this.segment = this.$linkSegment(BODY.SEGMENT);
	}

	*execute (vm, scope) {
		for (let statement of this.segment) {
			for(let value of statement.doExecution(vm, scope)) {
				if (value === 'PROCESS::RETURN') {
					return;
				}
				
				yield value;
			}
		}
	}
}

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
module.exports = ProcessStatement.register('PROCESS');