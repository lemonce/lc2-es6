const Statement = require('../statement');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ES?:'
 *          SOURCES: <expression | the left >
 * 		}
 * 	}
 */
class ESConditionStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.condition = this.$linkBySymbol(BODY.CONDITION);
		this.true = this.$linkBySymbol(BODY.TRUE);
		this.false = this.$linkBySymbol(BODY.FALSE);
	}
	
	*execute(vm, scope) {
		yield* this.condition.doExecution(vm, scope);
		const condition = vm.ret;

		if (condition) {
			yield* this.true.doExecution(vm, scope);
		} else {
			yield* this.false.doExecution(vm, scope);
		}

		yield vm.$writeback(null, vm.ret);
	}
}
ESConditionStatement.register('ES?:');