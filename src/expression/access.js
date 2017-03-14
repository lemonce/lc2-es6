const {Statement} = require('es-vm');

class PropertyAccessStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.base = this.$linkBySymbol(BODY.BASE);
		this.destination = this.$linkBySymbol(BODY.DESTINATION);
	}

	*execute(vm, scope) {
		yield* this.base.doExecution(vm, scope);
		const base = vm.ret;

		yield* this.destination.doExecution(vm, scope);
		const destination = vm.ret;

		yield vm.writeback(null, base[destination]);
	}
}

class VariableAccessStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
	}

	*execute(vm, scope) {
		yield vm.writeback(null, scope[this.identifier]);
	}
}

VariableAccessStatement.register('ACCESS::VARIABLE');
PropertyAccessStatement.register('ACCESS::PROPERTY');

class SimpleLiteralStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.destination = BODY.DESTINATION;
	}

	*execute(vm) {
		yield vm.writeback(null, this.destination);
	}
}

class ArrayLiteralStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});
		
		this.list = [];

		BODY.LIST.forEach(statement => {
			this.list.push(this.$linkBySymbol(statement));
		});
	}

	*execute(vm, scope) {
		const array = [];

		for(let element of this.list) {
			yield* element.doExecution(vm, scope);
			array.push(vm.ret);
		}

		yield vm.writeback(null, array);
	}

}

ArrayLiteralStatement.register('LITERAL::ARRAY');
SimpleLiteralStatement.register('LITERAL::SIMPLE');

function AssignmentStatementFactory(symbol, operation) {
	class AssignmentStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});

			this.left = this.$linkBySymbol(BODY.LEFT);
			this.right = this.$linkBySymbol(BODY.RIGHT);
		}
		
		*execute(vm, scope) {
			let base = scope;
			if (this.left instanceof PropertyAccessStatement) {
				yield* this.left.base.doExecution(vm, scope);
				base = vm.ret;
			}

			let destination;
			if (this.left instanceof PropertyAccessStatement) {
				yield* this.left.destination.doExecution(vm, scope);
				destination = vm.ret;
			} else if (this.left instanceof VariableAccessStatement) {
				destination = this.left.identifier;
			} else {
				throw new Error('[LVCM-DEV]: AccessStatement is undefined.');
			}
			
			yield* this.right.doExecution(vm, scope);
			const right = vm.ret;

			try {				
				yield vm.writeback(null, doOperation(operation, base, destination, right));	
			} catch (err) {
				vm.writeback(err, null).$halt();
			}
		}
	}

	return AssignmentStatementClass.register(symbol);
}

function doOperation(operation, base, destination, value) {
	const ret = operation(base, destination, value);

	if(typeof ret === 'number' && !isFinite(ret)) {
		throw new Error(`[LCVM]: Invalid operand: ${ret}.`);
	}

	return ret;
}

const operationSymbolMap = {
	'ES=': (base, destination, value) => base[destination] = value,
	'ES+=': (base, destination, value) => base[destination] += value,
	'ES-=': (base, destination, value) => base[destination] -= value,
	'ES*=': (base, destination, value) => base[destination] *= value,
	'ES/=': (base, destination, value) => base[destination] /= value,
	'ES%=': (base, destination, value) => base[destination] %= value
};

for(let symbol in operationSymbolMap) {
	AssignmentStatementFactory(symbol, operationSymbolMap[symbol]);
}
module.exports = AssignmentStatementFactory;