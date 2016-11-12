const ExecutableStatement = require('../executable');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'EXPRESSION'
 *          EXPRESSION: <string | lc2 expression => es statement >
 * 		}
 * 	}
 */
class ExpressionStatement extends ExecutableStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION, BODY});

		this.expression = BODY.EXPRESSION;
	}

	getReturn (ret) {
		console.log(`[EXP]${ret}`);
	}
	
	*execute (vm) {
		yield vm.$writeback(null, this.expression);
	}
}

module.exports = ExpressionStatement.register('EXPRESSION');