const {Statement} = require('es-vm');

class AccessStatement extends Statement {
	*getBase() {
		throw yield new Error('[LCVM-DEV]: Need defination to base.');
	}

	*getDestination() {
		throw yield new Error('[LCVM-DEV]: Need defination to destination.');
	}

	*execute(vm, scope) {
		const base = yield* this.getBase(vm, scope);
		const destination = yield* this.getDestination(vm, scope);

		yield vm.writeback(null, base[destination]);
	}
}

class VariableAccessStatement extends AccessStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
	}

	*getBase(vm, scope) {
		yield;
		return scope;
	}

	*getDestination() {
		yield;
		return this.identifier;
	}
}

class ExpressionPropertyAccessStatement extends AccessStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.base = this.$linkBySymbol(BODY.BASE);
		this.destination = this.$linkBySymbol(BODY.DESTINATION);
	}

	*getBase(vm, scope) {
		yield* this.base.doExecution(vm, scope);
		return vm.ret;
	}

	*getDestination(vm, scope) {
		yield* this.destination.doExecution(vm, scope);
		return vm.ret;
	}
}

class IdentifierPropertyAccessStatement extends AccessStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.base = this.$linkBySymbol(BODY.BASE);
		this.identifier = BODY.IDENTIFIER;
	}
	
	*getBase(vm, scope) {
		yield* this.base.doExecution(vm, scope);
		return vm.ret;
	}
	
	*getDestination() {
		yield;
		return this.identifier;
	}
}
 
ExpressionPropertyAccessStatement.register('ACCESS::PROPERTY::EXPRESSION');
IdentifierPropertyAccessStatement.register('ACCESS::PROPERTY::IDENTIFIER');
VariableAccessStatement.register('ACCESS::VARIABLE');

function AssignmentStatementFactory(symbol, operation) {
	class AssignmentStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});

			this.left = this.$linkBySymbol(BODY.LEFT);
			this.right = this.$linkBySymbol(BODY.RIGHT);
		}
		
		*execute(vm, scope) {
			const base = yield* this.left.getBase(vm, scope);
			const destination = yield* this.left.getDestination(vm, scope);
			
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