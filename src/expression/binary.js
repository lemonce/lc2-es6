const {Statement} = require('es-vm');
const assert = require('assert');

function BinaryOperatorStatementFactory(symbol, operation) {
	class BinaryOperatorStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});

			this.left = this.linkNode(BODY.LEFT);
			this.right = this.linkNode(BODY.RIGHT);
		}

		*execute($) {
			const left = yield* this.left.doExecution($);
			const right = yield* this.right.doExecution($);

			return operation(left, right);	
		}
	}

	return BinaryOperatorStatementClass.register(symbol);
}

function doOperation(val) {
	if(typeof val === 'number' && !isFinite(val)) {
		throw new Error(`[LCVM]: Invalid operand in binary operation: ${val}.`);
	}
	return val;
}

function match(left, right) {
	const $left = String(left);

	if (right.test) {
		return right.test($left);
	}
	return Boolean(~$left.indexOf(String(right)));
}

const operationSymbolMap = {
	'ES+': (left, right) => doOperation(left + right),
	'ES-': (left, right) => doOperation(left - right),
	'ES*': (left, right) => doOperation(left * right),
	'ES/': (left, right) => doOperation(left / right),
	'ES%': (left, right) => doOperation(left % right),
	'ES==': (left, right) => left == right,
	'ES!=': (left, right) => left != right,
	'ES===': (left, right) => left === right,
	'ES!==': (left, right) => left !== right,
	'ES>': (left, right) => left > right,
	'ES>=': (left, right) => left >= right,
	'ES<': (left, right) => left < right,
	'ES<=': (left, right) => left <= right,
	'LC~~': (left, right) => match(left, right),
	'LC!~': (left, right) => !match(left, right),
	'LC=*=': (left, right) => {
		try {
			assert.deepEqual(left, right);
			return true;
		} catch (err) {
			return false;
		}
	}
};

for(let symbol in operationSymbolMap) {
	BinaryOperatorStatementFactory(symbol, operationSymbolMap[symbol]);
}

module.exports = BinaryOperatorStatementFactory;