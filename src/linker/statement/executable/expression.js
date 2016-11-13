const ExecutableStatement = require('../executable');
class ExpressionStatement extends ExecutableStatement {
	constructor ({POSITION}) {
		super({POSITION});
	}
	
	*execute (vm) {
		yield vm.$writeback(null, '[LCVM]: Abstract expression return.');
	}
}

module.exports = ExpressionStatement;