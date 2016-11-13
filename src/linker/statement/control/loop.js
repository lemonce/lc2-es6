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

	*execute (vm) {
		yield* this.condition.execute(vm);

		// Use to set condition ret for testing.
		vm.emit('[loop]', vm);

		if (vm.ret) {
			for (let statement of this.segment) {
				yield* statement.execute(vm);
			}
			yield* this.execute(vm);
		}
	}
}

module.exports = LoopStatement.register('LOOP');

