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
		yield* this.condition.execute(vm, scope);
		const condition = vm.ret;

		if (condition) {
			yield* this.true.execute(vm, scope);
		} else {
			yield* this.false.execute(vm, scope);
		}

		yield vm.$writeback(null, vm.ret, this.position);
	}
}
ESConditionStatement.register('ES?:');