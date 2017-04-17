const {Statement, register} = require('es-vm');

class ESNotStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.sources = this.linkNode(BODY.SOURCES);
	}
	
	*execute($) {
		const sources = yield* this.sources.doExecution($);

		return !sources;
	}
}
register(ESNotStatement, 'ES!');

class ESAndStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.linkNode(BODY.LEFT);
		this.right = this.linkNode(BODY.RIGHT);
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
register(ESAndStatement, 'ES&&');

class ESORStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.left = this.linkNode(BODY.LEFT);
		this.right = this.linkNode(BODY.RIGHT);
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
register(ESORStatement, 'ES||');