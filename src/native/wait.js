const {LC2Statement} = require('../lc2');

class WaitStatement extends LC2Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.delay = this.$linkBySymbol(BODY.DELAY);
	}
	
	*execute($) {
		const delay = Number(yield* this.delay.doExecution($));

		if (isNaN(delay)) {
			throw new Error('[LCVM]: Delay is not a number');
		}

		yield $.vm.$setTimeout(() => $.vm.$run(), delay);
		this.output($, 'wait', {delay});
		yield 'VM::BLOCKED';

		return yield true;
	}
}
module.exports = WaitStatement.register('WAIT');