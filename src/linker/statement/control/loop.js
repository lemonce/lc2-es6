const ControlStatement = require('../control');
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
		yield* this.condition.execute(vm, scope);

		// Use to set condition ret for testing.
		vm.emit('[loop]', vm);

		if (vm.ret) {
			for (let statement of this.segment) {
				yield* statement.execute(vm, scope);
			}
			yield* this.execute(vm, scope);
		}
	}
}

module.exports = LoopStatement.register('LOOP');

