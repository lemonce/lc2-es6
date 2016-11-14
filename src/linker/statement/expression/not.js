const Statement = require('../statement');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ES!'
 *          SOURCES: <expression | the left >
 * 		}
 * 	}
 */
class ESNotStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.sources = this.$linkBySymbol(BODY.SOURCES);
		this.right = this.$linkBySymbol(BODY.RIGHT);
	}
	
	*execute(vm, scope) {
		yield* this.sources.execute(vm, scope);
		const sources = vm.ret;

		yield vm.$writeback(null, !sources, this.position);
	}
}
ESNotStatement.register('ES!');