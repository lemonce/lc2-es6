
const DriverStatement = require('../driver');

const pointerSymbolMap = {
	'ACTION::CLICK': 'doClick',
	'ACTION::DBLCLICK': 'doDblclick',
	'ACTION::RCLICK': 'doRclick',
	'ACTION::MOVEIN': 'doMovein',
	'ACTION::MOVEOUT': 'doMoveout',
	'ACTION::DROP': 'doDrop',
	'ACTION::HOLD': 'doHold'
};

/**
 * 	<pointer:action> <selector>
 * 		on <left>, <top>
 * 		in <limit>
 */
function PointerStatementFactory(symbol, method) {
	class PointerStatementClass extends DriverStatement {
		constructor({POSITION, BODY}) {
			super({POSITION});

			this.selector = this.$linkBySymbol(BODY.SELECTOR);
			this.offsetTop = BODY.OFFSET_TOP && this.$linkBySymbol(BODY.OFFSET_TOP);
			this.offsetLeft = BODY.OFFSET_LEFT && this.$linkBySymbol(BODY.OFFSET_LEFT);
			this.limit = BODY.LIMIT && this.$linkBySymbol(BODY.LIMIT);
		}

		*execute(vm, scope) {
			yield* this.selector.doExecution(vm, scope);
			const selector = vm.ret;

			// yield* this.offsetTop.doExecution(vm, scope);
			// const offsetTop = vm.ret;

			// yield* this.offsetLeft.doExecution(vm, scope);
			// const offsetLeft = vm.ret;

			let limit;
			if (this.limit) {
				yield* this.limit.doExecution(vm, scope);
				limit = vm.ret;
			} else {
				limit = vm.options.limit;
			}

			yield vm.fetch({
				method,
				args: {
					selector,
					// offsetTop, offsetLeft
				}
			}, limit);

			yield vm.writeback(null, true);

			const autoWait = vm.options.wait;
			if (vm.options.wait >= 0) {
				vm.$block();
				yield setTimeout(() => vm.$run(), autoWait);
			}
		}
	}

	PointerStatementClass.register(symbol);
}

for(let symbol in pointerSymbolMap) {
	PointerStatementFactory(symbol, pointerSymbolMap[symbol]);
}

/**
 * 	move <[to <left>, <right>] | [on <selector>]>
 */
class MouseMoveStatement extends DriverStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		if (BODY.SELECTOR) {
			this.selector = this.$linkBySymbol(BODY.SELECTOR);
		} else {
			this.left = this.$linkBySymbol(BODY.LEFT);
			this.top = this.$linkBySymbol(BODY.TOP);
		}
	}

	*execute(vm, scope) {
		if (this.selector) {
			yield* this.selector.doExecution(vm, scope);
			const selector = vm.ret;

			yield vm.fetch({method: 'doMove', args: {selector}});
		} else {
			yield* this.left.doExecution(vm, scope);
			const left = vm.ret;

			yield* this.top.doExecution(vm, scope);
			const top = vm.ret;

			yield vm.fetch({method: 'doMove', args: {left, top}});
		}

		yield vm.writeback(null, true);
	}
}
MouseMoveStatement.register('ACTION::MOVE');

//TODO wheel