const {ControlStatement} = require('../lc2');
const {Statement, register} = require('es-vm');

class LoopStatement extends ControlStatement {
	*executeSegment($) {
		try {
			for (let statement of this.segment) {
				yield* statement.doExecution($);
			}
		} catch (signal) {
			if (signal.type === 'break') {
				return false;
			} else if (signal.type === 'continue') {
				return true;
			}

			throw signal;
		}

		return LoopStatement.LOOP_CONTINIU;
	}
}

class IteratorStatement extends LoopStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.iterable = this.linkNode(BODY.ITERABLE);
		this.segment = this.linkSegment(BODY.SEGMENT);
	}
}

class ItemIteratorStatement extends IteratorStatement {
	*execute($) {
		const iterable = yield* this.iterable.doExecution($);

		for(let item of iterable) {
			$.scope[this.identifier] = item;

			if (yield* this.executeSegment($) === false) {
				return;
			}
		}
	}
}

class KeyIteratorStatement extends IteratorStatement {
	*execute($) {
		const iterable = yield* this.iterable.doExecution($);

		for(let item in iterable) {
			$.scope[this.identifier] = item;

			if (yield* this.executeSegment($) === false) {
				return;
			}
		}
	}
}

class WhileLoopStatement extends LoopStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.condition = this.linkNode(BODY.CONDITION);
		this.segment = this.linkSegment(BODY.SEGMENT);
	}

	*execute($) {
		const CONSTANT_TRUE = true;
		
		while (CONSTANT_TRUE) {
			const condition = Boolean(yield* this.condition.doExecution($));
			
			if (!condition) {
				return;
			}

			if(yield* this.executeSegment($) === false) {
				return;
			}
		}
	}
}

class BreakStatement extends Statement {
	*execute() {
		throw {type: 'break'};
	}
}

class ContinueStatement extends Statement {
	*execute() {
		throw {type: 'continue'};
	}
}

register(ItemIteratorStatement, 'ITERATOR::ITEM');
register(KeyIteratorStatement, 'ITERATOR::KEY');
register(WhileLoopStatement, 'LOOP::WHILE');
register(ContinueStatement, 'CONTINUE');
register(BreakStatement, 'BREAK');