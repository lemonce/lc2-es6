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

module.exports = VariableStatement.register('VARIABLE');