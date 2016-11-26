const DriverStatement = require('../driver');
/**
 *  input <selector>
 *      [by <value>],
 *      [in <limitation>]
 */
class InputStatement extends DriverStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		this.selector = this.$linkBySymbol(BODY.SELECTOR);
		this.value = this.$linkBySymbol(BODY.VALUE);
		this.limit = BODY.LIMIT && this.$linkBySymbol(BODY.LIMIT);
	}

	*execute(vm, scope) {
		yield* this.selector.doExecution(vm, scope);
		const selector = vm.ret;

		yield* this.value.doExecution(vm, scope);
		const value = vm.ret;

		let limit;
		if (this.limit) {
			yield* this.limit.doExecution(vm, scope);
			limit = vm.ret;
		} else {
			limit = vm.options.limit;
		}

		yield vm.fetch({
			method: 'doInput',
			args: {selector, value}
		}, limit);

		yield vm.writeback(null, true);

		const autoWait = vm.options.wait;
		if (vm.options.wait) {
			vm.$block();
			yield setTimeout(() => vm.$run(), autoWait);
		}

	}
}

InputStatement.register('ACTION::INPUT');

//TODO keypress