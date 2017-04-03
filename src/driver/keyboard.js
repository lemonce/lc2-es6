const {DriverStatement} = require('../lc2');

class InputStatement extends DriverStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		this.selector = BODY.SELECTOR && this.$linkBySymbol(BODY.SELECTOR);
		this.value = this.$linkBySymbol(BODY.VALUE);
		this.limit = BODY.LIMIT && this.$linkBySymbol(BODY.LIMIT);
	}

	*execute($) {
		yield* this.autowait($.vm);

		const selector = yield* this.getSelector($);
		const value = yield* this.value.doExecution($);
		const startTime = Date.now();

		yield $.vm.fetch({
			method: 'doInput',
			args: {selector, value}
		}, yield* this.getLimit($));

		this.output($, 'action', {
			selector,
			action: 'input',
			success: true,
			param: value,
			duration: Date.now() - startTime
		});

		return true;
	}
}

InputStatement.register('ACTION::INPUT');

//TODO keypress