const {Statement} = require('es-vm');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ES!'
 *          SOURCES: <expression | the left >
 * 		}
 * 	}
 */
class ESNotStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.sources = this.$linkBySymbol(BODY.SOURCES);
	}
	
	*execute(vm, scope) {
		yield* this.sources.doExecution(vm, scope);
		const sources = vm.ret;

		yield vm.writeback(null, !sources);
	}
}
ESNotStatement.register('ES!');

/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ES&&'
 *          LEFT: <expression | the left >
 * 			RIGHT: <expression | the right >
 * 		}
 * 	}
 */
class ESAndStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.$linkBySymbol(BODY.LEFT);
		this.right = this.$linkBySymbol(BODY.RIGHT);
	}

	*execute(vm, scope) {
		yield* this.left.doExecution(vm, scope);
		const left = vm.ret;

		// If left part of && is false, then return left directly.
		if(left) {
			yield* this.right.doExecution(vm, scope);
			const right = vm.ret;
			yield vm.writeback(null, left && right);
		} else {
			yield vm.writeback(null, left);
		}
	}
}
ESAndStatement.register('ES&&');

class ESORStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.$linkBySymbol(BODY.LEFT);
		this.right = this.$linkBySymbol(BODY.RIGHT);
	}

	*execute(vm, scope) {
		yield* this.left.doExecution(vm, scope);
		const left = vm.ret;

		// If left part of || is true, then return left directly.
		if(!left) {
			yield* this.right.doExecution(vm, scope);
			const right = vm.ret;
			yield vm.writeback(null, left || right);
		} else {
			yield vm.writeback(null, left);
		}
	}
}
ESORStatement.register('ES||');