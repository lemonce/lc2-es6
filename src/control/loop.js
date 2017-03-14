const ControlStatement = require('../control');
const {Statement} = require('es-vm');
const {signal} = require('es-vm');

signal.register('BREAK');
signal.register('CONTINUE');

const EXECUTING = signal.get('EXECUTING');
const BREAK = signal.get('BREAK');
const CONTINUE = signal.get('CONTINUE');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'LOOP',
 * 			CONDITION: <string | condition expression>,
 *          SEGMENT: [<Statement...>]
 * 		}
 * 	}
 */
class LoopStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.condition = this.$linkBySymbol(BODY.CONDITION);
		this.segment = this.$linkSegment(BODY.SEGMENT);
	}

	*execute (vm, scope) {
		let loopContinueFlag = true;
		while (loopContinueFlag) {
			yield* this.condition.doExecution(vm, scope);
			// Use to set condition ret for testing.
			vm.emit('[loop]', vm);

			loopContinueFlag = Boolean(vm.ret);
			if (loopContinueFlag) {
				for (let statement of this.segment) {
					yield* statement.doExecution(vm, scope);

					const $signal = vm.signal;
					if ($signal === signal.get('RETURN')) {
						return;
					} else if ($signal === CONTINUE) {
						vm.signal = EXECUTING;
						break;
					} else if ($signal === BREAK) {
						vm.signal = EXECUTING;
						loopContinueFlag = false;
						break;
					}
				}
			}
			/* else break; */
		}
	}
}

class BreakStatement extends Statement {
	constructor ({POSITION}) {
		super({POSITION});
	}

	*execute (vm) {
		yield vm.signal = signal.get('BREAK');
	}
}

class ContinueStatement extends Statement {
	constructor ({POSITION}) {
		super({POSITION});
	}

	*execute (vm) {
		yield vm.signal = signal.get('CONTINUE');
	}
}


module.exports = LoopStatement.register('LOOP');
module.exports = ContinueStatement.register('CONTINUE');
module.exports = BreakStatement.register('BREAK');