const {LC2Statement} = require('../lc2');

class LogStatement extends LC2Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.log = this.$linkBySymbol(BODY.LOG);
	}

	*execute($) {
		const content = yield* this.log.doExecution($);
		this.output($, 'log', {content});
		
		return content;
	}
}
module.exports = LogStatement.register('LOG');