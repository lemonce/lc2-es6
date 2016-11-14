
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
			this.offsetTop = this.$linkBySymbol(BODY.OFFSET_TOP);
			this.offsetLeft = this.$linkBySymbol(BODY.OFFSET_LEFT);
			this.limit = this.$linkBySymbol(BODY.LIMIT);
		}

		*execute(vm, scope) {
			yield* this.selector.execute(vm, scope);
			const selector = vm.ret;

			yield* this.offsetTop.execute(vm, scope);
			const offsetTop = vm.ret;

			yield* this.offsetLeft.execute(vm, scope);
			const offsetLeft = vm.ret;

			yield* this.limit.execute(vm, scope);
			const limit = vm.ret;

			//TODO watchdog

			yield vm.$fetch({method, args: {selector, offsetTop, offsetLeft}});
			yield vm.$writeback(null, true);
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
			yield* this.selector.execute(vm, scope);
			const selector = vm.ret;

			yield vm.$fetch({method: 'doMove', args: {selector}});
		} else {
			yield* this.left.execute(vm, scope);
			const left = vm.ret;

			yield* this.top.execute(vm, scope);
			const top = vm.ret;

			yield vm.$fetch({method: 'doMove', args: {left, top}});
		}

		yield vm.$writeback(null, true);
	}
}
MouseMoveStatement.register('ACTION::MOVE');

//TODO wheel