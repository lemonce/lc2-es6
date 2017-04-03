const {ControlStatement} = require('../lc2');
const {Statement} = require('es-vm');

class ProcessStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.parameter = Array.from(BODY.PARAMETER);

		this.segment = this.$linkSegment(BODY.SEGMENT);
	}

	*execute($) {
		for (let statement of this.segment) {
			for(let value of statement.doExecution($)) {
				if (value === 'PROCESS::RETURN') {
					return $.scope['<RETURN>'];
				}
				
				yield value;
			}
		}
	}
}

class ReturnStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.ret = this.$linkBySymbol(BODY.RET);
	}

	*execute($) {
		$.scope['<RETURN>'] = yield* this.ret.doExecution($);

		yield 'PROCESS::RETURN';
	}
}

ReturnStatement.register('RETURN');
module.exports = ProcessStatement.register('PROCESS');