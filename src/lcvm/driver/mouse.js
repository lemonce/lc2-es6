
const DriverStatement = require('../driver');

const pointerSymbolMap = {
	'ACTION::CLICK': {method: 'doClick', action: 'click'},
	'ACTION::DBLCLICK': {method: 'doDblclick', action: 'dblclick'},
	'ACTION::RCLICK': {method: 'doRclick', action: 'rclick'},
	'ACTION::HOLD': {method: 'doHold', action: 'hold'},
	'ACTION::MOVE': {method: 'doMove', action: 'move'},
	'ACTION::SCROLL': {method: 'doScroll', action: 'scroll'}
};

/**
 * 	<pointer:action> <selector>
 * 		on <left>, <top>
 * 		in <limit>
 */
function PointerStatementFactory(symbol, {method, action}) {
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

			const startTime = Date.now();
			yield vm.fetch({
				method,
				args: {
					selector,
					// offsetTop, offsetLeft
				}
			}, limit);

			yield vm.emit('driver', {
				type: 'action',
				data: {
					action, selector,
					line: this.position && this.position.LINE,
					success: true,
					param: null,
					duration: Date.now() - startTime
				}
			});
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
class MouseDropStatement extends DriverStatement {
	constructor({POSITION}) {
		super({POSITION});
	}

	*execute(vm) {
		const startTime = Date.now();
		yield vm.fetch({method: 'doDrop', args: {}});
		yield vm.emit('driver', {
			type: 'action',
			data: {
				action: 'drop',
				line: this.position && this.position.LINE,
				success: true,
				param: null,
				duration: Date.now() - startTime
			}
		});
		yield vm.writeback(null, true);
	}
}
MouseDropStatement.register('ACTION::DROP');

//TODO wheel