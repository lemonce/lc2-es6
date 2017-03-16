const ControlStatement = require('../control');

class ProcessStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.parameter = Array.from(BODY.PARAMETER);

		this.segment = this.$linkSegment(BODY.SEGMENT);
	}

	*execute (vm, scope) {
		for (let statement of this.segment) {
			for(let value of statement.doExecution(vm, scope)) {
				if (value === 'PROCESS::RETURN') {
					return;
				}
				
				yield value;
			}
		}
	}
}

module.exports = ProcessStatement.register('PROCESS');