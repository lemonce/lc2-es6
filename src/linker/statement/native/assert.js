const Statement = require('../statement');
/**
 * 	assert <expression>
 * 		in <expression>
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ACTION',
 * 			TEST: <string | a lc2 expression witch to test>
 * 		}
 * 	}
 */

class AssertStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.test = BODY.TEST;
		this.limit = this.$linkBySymbol(BODY.LIMIT);
	}

	*test(vm, scope) {
		yield* this.test.doExecution(vm, scope);
		
		return vm.ret;
	}
	
	*execute(vm, scope) {
		yield* this.limit.doExecution(vm, scope);
		const limit = vm.ret || vm.options.globalLimit;
		
		//TODO onceTest


		//TODO cycleTest

	}
}
module.exports = AssertStatement;