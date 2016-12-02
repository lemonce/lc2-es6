const {Statement} = require('../../esvm/');
/**
 * 	assert <expression>
 * 		in <expression>
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ACTION',
 * 			TEST: <expression | a lc2 expression witch to test>,
 * 			LIMIT: <expression>
 * 		}
 * 	}
 */

class AssertStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.test = this.$linkBySymbol(BODY.TEST);
		this.limit = BODY.LIMIT && this.$linkBySymbol(BODY.LIMIT);
	}

	*execute(vm, scope) {
		let limit;
		if (this.limit) {
			yield* this.limit.doExecution(vm, scope);
			limit = vm.ret;
		} else {
			limit = vm.options.limit;
		}
		
		const cycleTestStart = Date.now();
		while (Date.now() - cycleTestStart <= limit) {
			yield* this.test.doExecution(vm, scope);
			vm.emit('[ASSERT]', vm);
			let test = Boolean(vm.ret);
			
			if (test === true) {
				yield vm.writeback(null, true);
				return;
			} else {
				vm.$block();
				setTimeout(() => {
					//Issue: I don't know when the vm lose $runtime.
					vm.$runtime && vm.$run();
				}, 50);
			}
		}
		yield vm.writeback(new Error('[LCVM-ASSERT]: Assertion Failure.'), false);
	}
}
module.exports = AssertStatement.register('ASSERT');