const ExecutableStatement = require('../executable');
// const ExpressionStatement = require('./expression');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'JUMPTO',
 *          URL: <ExpressionStatement>
 * 		}
 * 	}
 */
class JumptoStatement extends ExecutableStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.url = this.$linkBySymbol(BODY.URL);
	}
	
	*execute(vm) {
		yield* this.url.execute(vm);

		// Fetch = respond
		yield vm.$fetch({
			method: 'goto',
			args: { url: vm.ret }
		});

		yield vm.$writeback(null, true);
	}
}

module.exports = JumptoStatement.register('JUMPTO');