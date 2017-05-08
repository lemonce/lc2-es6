const {register} = require('es-vm');
const {LC2Statement} = require('../lc2');

class WaitStatement extends LC2Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.delay = this.linkNode(BODY.DELAY);
	}
	
	*execute($) {
		const delay = Number(yield* this.delay.doExecution($));

		this.output($, 'wait', {delay});
		
		yield* this.autowait($.vm, delay);

		return yield true;
	}
}

register(WaitStatement, 'WAIT');