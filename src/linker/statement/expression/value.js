const Statement = require('../statement');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'VARIABLE'
 *          IDENTIFIER: <string>
 * 		}
 * 	}
 */
class VariableStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
	}

	*execute(vm, scope) {
		yield vm.$writeback(null, scope[this.identifier]);
	}
}

/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'LITERAL'
 *          DESTINATION: <... | the literal >
 * 		}
 * 	}
 */
class LiteralStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.destination = BODY.DESTINATION;
	}

	*execute(vm) {
		yield vm.$writeback(null, this.destination);
	}
}

LiteralStatement.register('LITERAL');
VariableStatement.register('VARIABLE');