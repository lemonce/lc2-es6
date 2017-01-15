const {Statement} = require('es-vm');
class ControlStatement extends Statement {
	$linkSegment (segment) {
		if (!Array.isArray(segment)) {
			throw new Error('[LCVM-DEV]: Invalid segment.');
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