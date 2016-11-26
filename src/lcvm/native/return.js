const {signal} = require('../../esvm');
const {Statement} = require('../../esvm/');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'RETURN',
 * 			RET: <string | lc2 expression => es statement >,
 * 		}
 * 	}
 */
class ReturnStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.ret = this.$linkBySymbol(BODY.RET);
	}

	*execute (vm, scope) {
		yield* this.ret.doExecution(vm, scope);

		vm.signal = signal.get('RETURN');
		yield vm.popScope()
			.writeback(null, vm.ret);
	}
}

module.exports = ReturnStatement.register('RETURN');
