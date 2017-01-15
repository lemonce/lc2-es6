const {signal} = require('es-vm');
const ControlStatement = require('../control');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'PROCESS',
 * 			IDENTIFIER: <string | name of the process>,
 *          SEGMENT: [<Statement...>],
 *          PARAMETER: [<string | argument identifier>,...]
 * 		}
 * 	}
 */
class ProcessStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.parameter = Array.from(BODY.PARAMETER);

		this.segment = this.$linkSegment(BODY.SEGMENT);
	}
	
	*execute (vm, scope) {
		for (let statement of this.segment) {
			if (vm.signal === signal.get('RETURN')) {
				break;
			} else {
				yield* statement.doExecution(vm, scope);
			}
		}

		vm.signal = signal.get('EXECUTING');
		return 0;
	}
}

module.exports = ProcessStatement.register('PROCESS');

