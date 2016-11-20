const Statement = require('../statement');

function BinaryOperatorStatementFactory(symbol, operation) {
	class BinaryOperatorStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});

			this.identifier = BODY.IDENTIFIER;
			this.left = this.$linkBySymbol(BODY.LEFT);
			this.right = this.$linkBySymbol(BODY.RIGHT);
		}

		*execute(vm, scope) {
			yield* this.left.doExecution(vm, scope);
			const left = vm.ret;

			yield* this.right.doExecution(vm, scope);
			const right = vm.ret;

			yield vm.$writeback(null, operation(left, right));
		}
	}

	return BinaryOperatorStatementClass.register(symbol);
}

function match(left, right) {
	const $left = String(left);

	if (right.test) {
		return right.test($left);
	}
	return Boolean(~$left.indexOf(String(right)));
}

const operationSymbolMap = {
	'ES+': (left, right) => left + right,
	'ES-': (left, right) => left - right,
	'ES*': (left, right) => left * right,
	'ES/': (left, right) => left / right,
	'ES%': (left, right) => left % right,
	'ES&&': (left, right) => left && right,
	'ES||': (left, right) => left || right,
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