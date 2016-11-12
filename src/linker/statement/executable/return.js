const ExecutableStatement = require('../executable');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'RETURN',
 * 			RET: <string | lc2 expression => es statement >,
 * 		}
 * 	}
 */
class ReturnStatement extends ExecutableStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.ret = ReturnStatement.linkBySymbol(BODY.RET);
	}

	*execute (vm) {
		yield* this.ret.execute(vm);
		yield vm.$setReturn()
			.popScope()
			.$writeback(null, vm.ret, this.position);
	}
}

module.exports = ReturnStatement.register('RETURN');
