const ExecutableStatement = require('../executable');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'CALL',
 *          IDENTIFIER: <string | process name>
 * 		}
 * 	}
 */
class CallStatement extends ExecutableStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
	}

	*execute (vm) {
		//TODO regist scope to vm scope stack.
		const invoking = vm.$getProcess(this.identifier).execute(vm);
		vm.pushScope({invoking});
		yield* invoking;
	}
}
CallStatement.callMainProcess = 
	new CallStatement({ BODY: { IDENTIFIER: 'main' }});

module.exports = CallStatement.register('CALL');
