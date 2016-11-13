const ExpressionStatement = require('../expression');

/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ES+'
 *          LEFT: <expression | the dst >
 *          RIGHT: <expression | the src >
 * 		}
 * 	}
 */
class ESAdditionStatement extends ExpressionStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.$linkBySymbol(BODY.LEFT);
		this.right = this.$linkBySymbol(BODY.RIGHT);

	}
	
	*execute(vm, scope) {
		yield* this.left.execute(vm, scope);
		const left = vm.ret;

		yield* this.right.execute(vm, scope);
		const right = vm.ret;

		yield vm.$writeback(null, left + right, this.position);
	}
}

/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ES-'
 *          LEFT: <expression | the dst >
 *          RIGHT: <expression | the src >
 * 		}
 * 	}
 */
class ESSubtractionStatement extends ExpressionStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.$linkBySymbol(BODY.LEFT);
		this.right = this.$linkBySymbol(BODY.RIGHT);

	}
	
	*execute(vm, scope) {
		yield* this.left.execute(vm, scope);
		const left = vm.ret;

		yield* this.right.execute(vm, scope);
		const right = vm.ret;

		yield vm.$writeback(null, left - right, this.position);
	}
}

/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ES*'
 *          LEFT: <expression | the dst >
 *          RIGHT: <expression | the src >
 * 		}
 * 	}
 */
class ESMultiplicationStatement extends ExpressionStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.$linkBySymbol(BODY.LEFT);
		this.right = this.$linkBySymbol(BODY.RIGHT);

	}
	
	*execute(vm, scope) {
		yield* this.left.execute(vm, scope);
		const left = vm.ret;

		yield* this.right.execute(vm, scope);
		const right = vm.ret;

		yield vm.$writeback(null, left * right, this.position);
	}
}

ESAdditionStatement.register('ES+');
ESSubtractionStatement.register('ES-');
ESMultiplicationStatement.register('ES*');