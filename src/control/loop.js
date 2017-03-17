const ControlStatement = require('../control');
const {Statement} = require('es-vm');

class LoopStatement extends ControlStatement {
	*executeSegment(vm, scope) {
		for (let statement of this.segment) {
			const statementRuntime = statement.doExecution(vm, scope);

			for(let value of statementRuntime) {
				if (value === 'LOOP::CONTINUE') {
					return LoopStatement.LOOP_END;
				} else if (value === 'LOOP::BREAK') {
					return LoopStatement.LOOP_BREAK;
				}

				yield value;
			}
		}

		return LoopStatement.LOOP_END;
	}

	static get LOOP_END() {
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
		this.iterable = this.$linkBySymbol(BODY.ITERABLE);
		this.segment = this.$linkSegment(BODY.SEGMENT);
	}
}

class ItemIteratorStatement extends IteratorStatement {
	*execute(vm, scope) {
		yield* this.iterable.doExecution(vm, scope);
		const iterable = vm.ret;

		for(let item of iterable) {
			scope[this.identifier] = item;

			const nextFlag = yield* this.executeSegment(vm, scope);
			if (!nextFlag) {
				return;
			}
		}
	}
}

class KeyIteratorStatement extends IteratorStatement {
	*execute(vm, scope) {
		yield* this.iterable.doExecution(vm, scope);
		const iterable = vm.ret;

		for(let item in iterable) {
			scope[this.identifier] = item;

			const nextFlag = yield* this.executeSegment(vm, scope);
			if (!nextFlag) {
				return;
			}
		}
	}
}

ItemIteratorStatement.register('ITERATOR::ITEM');
KeyIteratorStatement.register('ITERATOR::KEY');

class WhileLoopStatement extends LoopStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.condition = this.$linkBySymbol(BODY.CONDITION);
		this.segment = this.$linkSegment(BODY.SEGMENT);
	}

	*execute (vm, scope) {
		const CONSTANT_TRUE = true;
		
		while (CONSTANT_TRUE) {
			yield* this.condition.doExecution(vm, scope);
			// Use to set condition ret for testing.
			vm.emit('[loop]', vm);

			const condition = Boolean(vm.ret);
			
			
			if (!condition) {
				return;
			}

			const nextFlag = yield* this.executeSegment(vm, scope);
			if(!nextFlag) {
				return;
			}
		}
	}
}

class BreakStatement extends Statement {
	*execute () {
		yield 'LOOP::BREAK';
	}
}

class ContinueStatement extends Statement {
	*execute () {
		yield 'LOOP::CONTINUE';
	}
}

WhileLoopStatement.register('LOOP::WHILE');
ContinueStatement.register('CONTINUE');
BreakStatement.register('BREAK');