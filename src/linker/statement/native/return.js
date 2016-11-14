const Statement = require('../statement');
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

	*execute (vm) {
		yield* this.ret.execute(vm);

		vm.signal = Symbol.for('RETURN');
		yield vm.popScope()
			.$writeback(null, vm.ret, this.position);
	}
}

module.exports = ReturnStatement.register('RETURN');
