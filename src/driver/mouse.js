const DriverStatement = require('../driver');

const pointerSymbolMap = {
	'ACTION::CLICK': {method: 'doClick', action: 'click'},
	'ACTION::DBLCLICK': {method: 'doDblclick', action: 'dblclick'},
	'ACTION::HOLD': {method: 'doHold', action: 'hold'},
	'ACTION::MOVE': {method: 'doMove', action: 'move'},
	'ACTION::SCROLL': {method: 'doScroll', action: 'scroll'}
};


function PointerStatementFactory(symbol, {method, action}) {
	class PointerStatementClass extends DriverStatement {
		constructor({POSITION, BODY}) {
			super({POSITION});

			this.selector = this.$linkBySymbol(BODY.SELECTOR || DriverStatement.SELECTOR_IT);
			this.limit = BODY.LIMIT && this.$linkBySymbol(BODY.LIMIT);
		}

		*execute(vm, scope) {
			const selector = yield* this.getSelector(vm, scope);
			
			const startTime = Date.now();
			yield vm.fetch({
				method,
				args: {
					selector,
					button: scope.$BUTTON
					// scope.$OFFSET_X, scope.$OFFSET_Y,
				}
			}, yield* this.getLimit(vm, scope));

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

			yield* this.autowait(vm);
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