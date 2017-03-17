const DriverStatement = require('../driver');
/**
 *  input <selector>
 *      [by <value>],
 *      [in <limitation>]
 */
class InputStatement extends DriverStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		this.selector = this.$linkBySymbol(BODY.SELECTOR || DriverStatement.SELECTOR_IT);
		this.value = this.$linkBySymbol(BODY.VALUE);
		this.limit = BODY.LIMIT && this.$linkBySymbol(BODY.LIMIT);
	}

	*execute(vm, scope) {
		const selector = yield* this.getSelector(vm, scope);

		yield* this.value.doExecution(vm, scope);
		const value = vm.ret;

		const startTime = Date.now();
		yield vm.fetch({
			method: 'doInput',
			args: {selector, value}
		}, yield* this.getLimit(vm));

		yield vm.emit('driver', {
			type: 'action',
			data: {
				selector,
				action: 'input',
				line: this.position && this.position.LINE,
				success: true,
				param: value,
				duration: Date.now() - startTime
			}
		});

		yield vm.writeback(null, true);

		yield* this.autowait(vm);
	}
}

InputStatement.register('ACTION::INPUT');

//TODO keypress