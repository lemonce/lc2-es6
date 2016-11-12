const ExecutableStatement = require('../executable');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'WAIT',
 *          WAIT: <string | lc2 expression>
 * 		}
 * 	}
 */
class WaitStatement extends ExecutableStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.delay = WaitStatement.linkBySymbol(BODY.DELAY);
	}
	
	*execute(vm) {
		yield* this.delay.execute(vm);

		yield setTimeout(() => vm.$writeback(null, true, this.position), vm.ret);
	}
};
module.exports = WaitStatement.register('WAIT');