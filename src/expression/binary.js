const {Statement} = require('es-vm');

function BinaryOperatorStatementFactory(symbol, operation) {
	class BinaryOperatorStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});

			this.left = this.$linkBySymbol(BODY.LEFT);
			this.right = this.$linkBySymbol(BODY.RIGHT);
		}

		*execute(vm, scope) {
			yield* this.left.doExecution(vm, scope);
			const left = vm.ret;

			yield* this.right.doExecution(vm, scope);
			const right = vm.ret;

			try {
				yield vm.writeback(null, operation(left, right));	
			} catch (err) {
				vm.writeback(err, null).$halt();
			}
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
};

for(let symbol in operationSymbolMap) {
	BinaryOperatorStatementFactory(symbol, operationSymbolMap[symbol]);
}

module.exports = BinaryOperatorStatementFactory;