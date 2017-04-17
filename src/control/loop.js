const {ControlStatement} = require('../lc2');
const {Statement, register} = require('es-vm');

class LoopStatement extends ControlStatement {
	*executeSegment($) {
		for (let statement of this.segment) {
			const runtime = statement.doExecution($);
			
			let ret = {}, $done = false;
			while (!$done) {
				const {done, value} =
					ret.err ? runtime.throw(ret.err) : runtime.next(ret.data);

				if (value === 'LOOP::CONTINUE') {
					return LoopStatement.LOOP_CONTINIU;
				} else if (value === 'LOOP::BREAK') {
					return LoopStatement.LOOP_BREAK;
				}
				
				$done = done;

				try {
					ret = {data: yield value};
				} catch (err) {
					ret = {err};
				}
			}
		}

		return LoopStatement.LOOP_CONTINIU;
	}

	static get LOOP_CONTINIU() {
		return true;
	}

	static get LOOP_BREAK() {
		return false;
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

			const nextFlag = yield* this.executeSegment($);
			if (!nextFlag) {
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

			const nextFlag = yield* this.executeSegment($);
			if (!nextFlag) {
				return;
			}
		}
	}
}

register(ItemIteratorStatement, 'ITERATOR::ITEM');
register(KeyIteratorStatement, 'ITERATOR::KEY');

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

			const nextFlag = yield* this.executeSegment($);
			if(!nextFlag) {
				return;
			}
		}
	}
}

class BreakStatement extends Statement {
	*execute() {
		yield 'LOOP::BREAK';
	}
}

class ContinueStatement extends Statement {
	*execute() {
		yield 'LOOP::CONTINUE';
	}
}

register(WhileLoopStatement, 'LOOP::WHILE');
register(ContinueStatement, 'CONTINUE');
register(BreakStatement, 'BREAK');