const ControlStatement = require('../control');

/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'PROCESS',
 * 			IDENTIFIER: <string | name of the process>,
 *          SEGMENT: [<Statement...>]
 * 		}
 * 	}
 */
class ProcessStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION, BODY});

		this.identifier = BODY.IDENTIFIER;

		this.segment = this.$linkSegment(BODY.SEGMENT);
	}

	signalRequest () {
		return this.identifier;
	}
	
	get eventArgs () {
		return {
			type: 'PROCESS',
			args: {
				identifier: this.identifier
			}
		};
	}

	*execute (vm) {
		for (let statement of this.segment) {
			if (vm.isReturn) {
				vm.$setExecuting();
				return true;
			} else {
				yield* statement.execute(vm);
			}
		}
	}
}

module.exports = ProcessStatement.register('PROCESS');

