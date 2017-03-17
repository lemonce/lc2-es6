const {Statement} = require('es-vm');

const SELECTOR_IT = {
	BODY: {
		SYMBOL: 'ACCESS::VARIABLE',
		IDENTIFIER: '$IT'
	}
};

class DriverStatement extends Statement {

	/**
	 * Get the selector of a statement and update it to $IT.
	 * If selector from statement is empty, use $IT instead.
	 * @param {Statement} driver
	 * @param {scope} scope
	 */
	selectElement(driver, scope) {
		if(!driver.selector && !scope.$IT) {
			throw new Error('[LCVM-DEV]: Empty selector founded.');
		}

		driver.selector = driver.selector || driver.$linkBySymbol({
			BODY: {
				SYMBOL: 'LITERAL',
				DESTINATION: scope.$IT
			}
		});

		scope.$IT = driver.selector.destination;
		return driver.selector;
	}

	*autowait(vm) {
		const autoWait = vm.options.wait;
		if (autoWait >= 0) {
			setTimeout(() => vm.$run(), autoWait);
			yield 'VM::BLOCKED';
		}
	}

	*getLimit(vm, scope) {
		let limit = vm.options.limit;
		if (this.limit) {
			yield* this.limit.doExecution(vm, scope);
			limit = vm.ret;
		}

		return limit;
	}

	*getSelector(vm, scope) {
		yield* this.selector.doExecution(vm, scope);
		const selector = vm.ret;
		if(!selector) {
			yield vm.writeback(new Error('[LCVM]: Empty selector founded.'), null);
		}
		return scope.$IT = selector;
	}

	static get SELECTOR_IT() {
		return SELECTOR_IT;
	}
}

module.exports = DriverStatement;