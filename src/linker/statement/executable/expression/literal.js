const ExpressionStatement = require('../expression');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'LITERAL'
 *          DESTINATION: <... | the literal >
 * 		}
 * 	}
 */
class LiteralStatement extends ExpressionStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.destination = BODY.DESTINATION;
	}

	*execute(vm) {
		yield vm.$writeback(null, this.destination, this.position);
	}
}

module.exports = LiteralStatement.register('LITERAL');