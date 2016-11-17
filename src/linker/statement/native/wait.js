const Statement = require('../statement');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'WAIT',
 *          WAIT: <string | lc2 expression>
 * 		}
 * 	}
 */
class WaitStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.delay = this.$linkBySymbol(BODY.DELAY);
	}
	
	*execute(vm) {
		yield* this.delay.doExecution(vm);
		vm.$block();
		yield setTimeout(() => {
			vm.$writeback(null, true);
			vm.$$run();
		}, vm.ret);
	}
}
module.exports = WaitStatement.register('WAIT');