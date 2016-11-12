
const Statement = require('../statement');
class ControlStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION, BODY});
	}

	$linkSegment (segment) {
		if (!Array.isArray(segment)) {
			throw new Error();
		}

		const linkedSegment = [];

		segment.forEach(statement => {
			const linked = Statement.linkBySymbol(statement);
			linkedSegment.push(linked);
		});

		return linkedSegment;
	}

	*execute (context) {
		yield this.signalRequest();
		const signalResponse = yield;
		
		const segment = this.querySegment(signalResponse);

		context.emit('control', this.eventArgs, this.position);
		for (let statement of segment) {
			yield* statement.execute(context);
		}
	}
}

module.exports = ControlStatement;