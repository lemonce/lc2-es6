const {Statement, register} = require('es-vm');

class LiteralStatement extends Statement {
	*execute($) {
		return yield* this.getBase($);
	}
}

class SimpleLiteralStatement extends LiteralStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.destination = BODY.DESTINATION;
	}

	*getBase() {
		return this.destination;
	}
}

class ObjectLiteralStatement extends LiteralStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});
		
		this.list = [];

		BODY.LIST.forEach(propertyStatement => {
			this.list.push(this.linkNode(propertyStatement));
		});
	}

	*getBase($) {
		const object = {};

		for(let {identifier, value} of this.list) {
			object[identifier] = yield* value.doExecution($);
		}

		return object;
	}
}

class ObjectLiteralPropertyDefinedStatement extends Statement{
	constructor({POSITION, BODY}) {
		super({POSITION});
		
		this.identifier = BODY.IDENTIFIER;
		this.value = this.linkNode(BODY.VALUE);
	}
}

class ArrayLiteralStatement extends LiteralStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});
		
		this.list = [];

		BODY.LIST.forEach(statement => {
			this.list.push(this.linkNode(statement));
		});
	}

	*getBase($) {
		const array = [];

		for(let element of this.list) {
			array.push(yield* element.doExecution($));
		}

		return array;
	}
}

register(ArrayLiteralStatement, 'LITERAL::ARRAY');
register(SimpleLiteralStatement, 'LITERAL::SIMPLE');
register(ObjectLiteralStatement, 'LITERAL::OBJECT');
register(ObjectLiteralPropertyDefinedStatement, 'LITERAL::OBJECT::PROPERTY', false);