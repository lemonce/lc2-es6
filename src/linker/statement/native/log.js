/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'LOG',
 *          LOG: <expression | lc2 expression about content>
 * 		}
 * 	}
 */
const Statement = require('../statement');

class LogStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.log = this.$linkBySymbol(BODY.LOG);
	}

	*execute(vm, scope) {
		yield* this.log.doExecution(vm, scope);
		vm.emit('log', vm.ret);
		yield vm.$writeback(null, vm.ret);
	}
}
module.exports = LogStatement.register('LOG');