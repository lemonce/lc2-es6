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
		yield* this.delay.execute(vm);
		vm.$block();
		yield setTimeout(() => {
			vm.$writeback(null, true, this.position);
			vm.$$run();
		}, vm.ret);
	}
}
module.exports = WaitStatement.register('WAIT');