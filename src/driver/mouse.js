const {DriverStatement} = require('../lc2');

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

			this.selector = BODY.SELECTOR && this.$linkBySymbol(BODY.SELECTOR);
			this.limit = BODY.LIMIT && this.$linkBySymbol(BODY.LIMIT);
		}

		*execute($) {
			yield* this.autowait($.vm);
			
			const selector = yield* this.getSelector($);
			const startTime = Date.now();

			yield $.vm.fetch({
				method,
				args: {
					selector,
					button: $.scope.$BUTTON
					// scope.$OFFSET_X, scope.$OFFSET_Y,
				}
			}, yield* this.getLimit($));

			this.output($, 'action', {
				action, selector,
				success: true,
				param: null,
				duration: Date.now() - startTime
			});

			return true;
		}
	}

	PointerStatementClass.register(symbol);
}

for(let symbol in pointerSymbolMap) {
	PointerStatementFactory(symbol, pointerSymbolMap[symbol]);
}

class MouseDropStatement extends DriverStatement {
	*execute($) {
		yield* this.autowait($.vm);
		
		const startTime = Date.now();

		yield $.vm.fetch({method: 'doDrop', args: {}});

		this.output($, 'action', {
			action: 'drop',
			success: true,
			param: null,
			duration: Date.now() - startTime
		});
		
		return true;
	}
}
MouseDropStatement.register('ACTION::DROP');

//TODO wheel