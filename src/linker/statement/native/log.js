/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'WAIT',
 *          LOG: <expression | lc2 expression about content>
 * 		}
 * 	}
 */
const Statement = require('../statement');

class LogStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.log = BODY.LOG;
	}

	*execute(vm, scope) {
		yield* this.log.execute(vm, scope);
		vm.emit('log', vm.ret);
		yield vm.$writeback(null, vm.ret, this.position);
	}
}
module.exports = LogStatement;