const {Statement, register} = require('es-vm');

class AccessStatement extends Statement {
	*execute($) {
		const base = yield* this.getBase($);
		const destination = yield* this.getDestination($);

		return base[destination];
	}
}

class VariableAccessStatement extends AccessStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
	}

	*getBase($) {
		return $.scope;
	}

	*getDestination() {
		return this.identifier;
	}
}

class ExpressionPropertyAccessStatement extends AccessStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.base = this.linkNode(BODY.BASE);
		this.destination = this.linkNode(BODY.DESTINATION);
	}

	*getBase($) {
		return yield* this.base.doExecution($);
	}

	*getDestination($) {
		return yield* this.destination.doExecution($);
	}
}

class IdentifierPropertyAccessStatement extends AccessStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.base = this.linkNode(BODY.BASE);
		this.identifier = BODY.IDENTIFIER;
	}
	
	*getBase($) {
		return yield* this.base.doExecution($);
	}
	
	*getDestination() {
		return this.identifier;
	}
}
 
register(ExpressionPropertyAccessStatement, 'ACCESS::PROPERTY::EXPRESSION');
register(IdentifierPropertyAccessStatement, 'ACCESS::PROPERTY::IDENTIFIER');
register(VariableAccessStatement, 'ACCESS::VARIABLE');

function AssignmentStatementFactory(symbol, operation) {
	class AssignmentStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});

			this.left = this.linkNode(BODY.LEFT);
			this.right = this.linkNode(BODY.RIGHT);
		}
		
		*execute($) {
			const base = yield* this.left.getBase($);
			const destination = yield* this.left.getDestination($);
			const right = yield* this.right.doExecution($);

			return doOperation(operation, base, destination, right);
		}
	}

	register(AssignmentStatementClass, symbol);
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