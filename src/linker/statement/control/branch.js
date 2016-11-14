const ControlStatement = require('../control');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'BRANCH',
 * 			CONDITION: <string | condition expression>,
 *          SEGMENT_TRUE: [<Statement...>],
 *          SEGMENT_FALSE: [<Statement...>]
 * 		}
 * 	}
 */
class BranchStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.condition = this.$linkBySymbol(BODY.CONDITION);

		this.segmentTrue = this.$linkSegment(BODY.SEGMENT_TRUE);
		this.segmentFalse = this.$linkSegment(BODY.SEGMENT_FALSE);
	}

	*execute (vm, scope) {
		yield* this.condition.execute(vm, scope);

		const segment = vm.ret ? this.segmentTrue : this.segmentFalse;
		for (let statement of segment) {
			yield* statement.execute(vm, scope);
		}
	}
}

module.exports = BranchStatement.register('BRANCH');