const {DriverStatement} = require('../lc2');
const {register} = require('es-vm');

class InputStatement extends DriverStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		this.selector = BODY.SELECTOR && this.linkNode(BODY.SELECTOR);
		this.value = this.linkNode(BODY.VALUE);
		this.limit = BODY.LIMIT && this.linkNode(BODY.LIMIT);
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

register(InputStatement, 'ACTION::INPUT');

const keyboardSymbolMap = {
	'ACTION::KEYDOWN': {method: 'doKeydown', action: 'keydown'},
	'ACTION::KEYUP': {method: 'doKeyup', action: 'keyup'},
	'ACTION::KEYPRESS': {method: 'doKeypress', action: 'keypress'}
};

function KeyboardStatementFactory(symbol, {method, action}) {
	class KeboardStatementClass extends DriverStatement {
		constructor({POSITION, BODY}) {
			super({POSITION});

			this.code = this.linkNode(BODY.KEY_EXPR);
			this.limit = BODY.LIMIT && this.linkNode(BODY.LIMIT);
		}

		*execute($) {
			yield* this.autowait($.vm);
			
			const code = yield* this.code.doExecution($);
			const startTime = Date.now();

			yield $.vm.fetch({method, args: {code}}, yield* this.getLimit($));

			this.output($, 'action', {
				action, code, success: true,
				duration: Date.now() - startTime
			});

			return true;
		}
	}

	register(KeboardStatementClass, symbol);
}

for(let symbol in keyboardSymbolMap) {
	KeyboardStatementFactory(symbol, keyboardSymbolMap[symbol]);
}