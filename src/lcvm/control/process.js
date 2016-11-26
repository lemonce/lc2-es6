const {signal} = require('../../esvm');
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
				vm.signal = signal.get('EXECUTING');
				break;
			} else {
				yield* statement.doExecution(vm, scope);
			}
		}

		return 0;
	}
}

module.exports = ProcessStatement.register('PROCESS');

