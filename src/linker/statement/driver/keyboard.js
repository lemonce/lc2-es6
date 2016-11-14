const DriverStatement = require('../driver');
/**
 *  input <selector>
 *      [by <value>],
 *      [in <waiting>]
 */
class InputStatement extends DriverStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		this.selector = this.$linkBySymbol(BODY.SELECTOR);
		this.value = this.$linkBySymbol(BODY.VALUE);
		this.limit = this.$linkBySymbol(BODY.LIMIT);
	}

	*execute(vm, scope) {
		yield* this.selector.execute(vm, scope);
		const selector = vm.ret;

		yield* this.value.execute(vm, scope);
		const value = vm.ret;

		yield* this.limit.execute(vm, scope);
		const limit = vm.ret;

		yield vm.$fetch({method: 'doInput', args: {selector, value}});
	}
}

InputStatement.register('ACTION::INPUT');

//TODO keypress