const Statement = require('../statement');
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
		yield vm.ret = this.destination;
	}
}

module.exports = LiteralStatement.register('LITERAL');