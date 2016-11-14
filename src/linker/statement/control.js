
const Statement = require('./statement');
class ControlStatement extends Statement {
	$linkSegment (segment) {
		if (!Array.isArray(segment)) {
			throw new Error();
		}

		const linkedSegment = [];

		segment.forEach(statement => {
			const linked = this.$linkBySymbol(statement);
			linkedSegment.push(linked);
		});

		return linkedSegment;
	}
}

module.exports = ControlStatement;