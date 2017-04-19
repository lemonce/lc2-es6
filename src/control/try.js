const {ControlStatement} = require('../lc2');
const {register, Statement} = require('es-vm');

class TryStatement extends ControlStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		this.trySegment = this.linkSegment(BODY.TRY_SEGMENT);
		
		this.catchIdentifier = BODY.CATCH_IDENTIFIER;
		this.catchSegment = this.linkSegment(BODY.CATCH_SEGMENT);
	}

	*execute($) {
		try {
			for(let statement of this.trySegment) {
				yield* statement.doExecution($);
			}
		} catch (err) {
			if (err === 'SIGNAL') {
				throw err;
			}

			//TODO use lc2 [Error Object]
			const $$ = {
				vm: $.vm,
				scope: $.scope.$new({
					[this.catchIdentifier]: err
				})
			};
			
			for(let statement of this.catchSegment) {
				yield* statement.doExecution($$);
			}
		}
	}
}

class ThrowStatement extends Statement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		this.throws = this.linkNode(BODY.THROW);
	}

	*execute($) {
		throw {
			type: 'throw',
			data:  yield* this.throws.doExecution($)
		};
	}
}

register(ThrowStatement, 'THROW');
exports.EvaluateStatement = register(TryStatement, 'TRY');