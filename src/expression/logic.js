const {Statement} = require('es-vm');

class ESNotStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.sources = this.$linkBySymbol(BODY.SOURCES);
	}
	
	*execute($) {
		const sources = yield* this.sources.doExecution($);

		return !sources;
	}
}
ESNotStatement.register('ES!');

class ESAndStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.$linkBySymbol(BODY.LEFT);
		this.right = this.$linkBySymbol(BODY.RIGHT);
	}

	*execute($) {
		const left = yield* this.left.doExecution($);

		// If left part of && is false, then return left directly.
		if(left) {
			const right = yield* this.right.doExecution($);
			return left && right;
		} 

		return left;
	}
}
ESAndStatement.register('ES&&');

class ESORStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.$linkBySymbol(BODY.LEFT);
		this.right = this.$linkBySymbol(BODY.RIGHT);
	}

	*execute($) {
		const left = yield* this.left.doExecution($);

		// If left part of || is true, then return left directly.
		if(!left) {
			const right = yield* this.right.doExecution($);
			return left || right;
		}
		
		return left;
	}
}
ESORStatement.register('ES||');