const {ControlStatement} = require('../lc2');
const {register} = require('es-vm');

class BranchStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.condition = this.linkNode(BODY.CONDITION);

		this.segmentTrue = this.linkSegment(BODY.SEGMENT_TRUE);
		this.segmentFalse = this.linkSegment(BODY.SEGMENT_FALSE || []);
	}

	*execute($) {
		const condition = yield* this.condition.doExecution($);

		const segment = condition ? this.segmentTrue : this.segmentFalse;

		for (let statement of segment) {
			yield* statement.doExecution($);
		}
	}
}

register(BranchStatement, 'BRANCH');

module.exports = BranchStatement;