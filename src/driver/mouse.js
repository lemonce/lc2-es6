
const DriverStatement = require('../driver');

const pointerSymbolMap = {
	'ACTION::CLICK': {method: 'doClick', action: 'click'},
	'ACTION::DBLCLICK': {method: 'doDblclick', action: 'dblclick'},
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

			this.selector = this.$linkBySymbol(BODY.SELECTOR || {
				BODY: {
					SYMBOL: 'VARIABLE',
					IDENTIFIER: '$IT'
				}
			});
			this.limit = BODY.LIMIT && this.$linkBySymbol(BODY.LIMIT);
		}

		*execute(vm, scope) {
			yield* this.selector.doExecution(vm, scope);
			const selector = vm.ret;
			if(!selector) {
				yield vm.writeback(new Error('[LCVM]: Empty selector founded.'), null);
			}
			scope.$IT = selector;
			
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
					// scope.$BUTTON
					// scope.$OFFSET_X, scope.$OFFSET_Y,
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
			// yield vm.writeback(null, true);

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