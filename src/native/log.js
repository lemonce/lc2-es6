/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'LOG',
 *          LOG: <expression | lc2 expression about content>
 * 		}
 * 	}
 */
const {Statement} = require('es-vm');

class LogStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.log = this.$linkBySymbol(BODY.LOG);
	}

	*execute(vm, scope) {
		yield* this.log.doExecution(vm, scope);
		const content = vm.ret;
		vm.emit('log', content);
		yield vm.emit('driver', {
			type: 'log',
			data: {
				line: this.position && this.position.LINE,
				content
			}
		});
		yield vm.writeback(null, vm.ret);
	}
}
module.exports = LogStatement.register('LOG');