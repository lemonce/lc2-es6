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
		yield* this.selector.doExecution(vm, scope);
		const selector = vm.ret;

		yield* this.value.doExecution(vm, scope);
		const value = vm.ret;

		yield* this.limit.doExecution(vm, scope);
		const limit = vm.ret || vm.options.globalLimit;

		yield vm.$fetch({
			method: 'doInput',
			args: {selector, value}
		}, limit);

		yield vm.$writeback(null, true);

		const autoWait = vm.options.globalWait;
		if (vm.options.globalWait) {
			vm.$block();
			yield setTimeout(() => vm.$$run(), autoWait);
		}

	}
}

InputStatement.register('ACTION::INPUT');

//TODO keypress