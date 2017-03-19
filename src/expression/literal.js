const {Statement} = require('es-vm');

class LiteralStatement extends Statement {
	*execute(vm, scope) {
		yield vm.writeback(null, yield* this.getBase(vm, scope));
	}
}

class SimpleLiteralStatement extends LiteralStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.destination = BODY.DESTINATION;
	}

	*getBase() {
		yield;
		return this.destination;
	}
}

class ObjectLiteralStatement extends LiteralStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});
		
		this.list = [];

		BODY.LIST.forEach(propertyStatement => {
			this.list.push(this.$linkBySymbol(propertyStatement));
		});
	}

	*getBase(vm, scope) {
		const object = {};

		for(let {identifier, value} of this.list) {
			yield* value.doExecution(vm, scope);

			object[identifier] = vm.ret;
		}

		return object;
	}
}

class ObjectLiteralPropertyDefinedStatement extends Statement{
	constructor({POSITION, BODY}) {
		super({POSITION});
		
		this.identifier = BODY.IDENTIFIER;
		this.value = this.$linkBySymbol(BODY.VALUE);
	}

	*execute() {
		
	}
}

class ArrayLiteralStatement extends LiteralStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});
		
		this.list = [];

		BODY.LIST.forEach(statement => {
			this.list.push(this.$linkBySymbol(statement));
		});
	}

	*getBase(vm, scope) {
		const array = [];

		for(let element of this.list) {
			yield* element.doExecution(vm, scope);
			array.push(vm.ret);
		}

		return array;
	}
}

ArrayLiteralStatement.register('LITERAL::ARRAY');
SimpleLiteralStatement.register('LITERAL::SIMPLE');
ObjectLiteralStatement.register('LITERAL::OBJECT');
ObjectLiteralPropertyDefinedStatement.register('LITERAL::OBJECT::PROPERTY');