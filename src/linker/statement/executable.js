
const Statement = require('../statement');
class ExecutableStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION, BODY});
	}

	*execute (context) {
		context.$writeback();
		yield;
	}
}
module.exports = ExecutableStatement;