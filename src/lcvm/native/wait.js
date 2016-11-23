const {Statement} = require('../../esvm/');
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
		//TODO check vm.ret is Number or not.
		yield setTimeout(() => {
			vm.writeback(null, true);
			vm.emit('[WAIT]', vm);
			vm.$run();
		}, vm.ret);
	}
}
module.exports = WaitStatement.register('WAIT');