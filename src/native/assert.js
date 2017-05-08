const {register} = require('es-vm');
const {LC2Statement} = require('../lc2');

class AssertStatement extends LC2Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.test = this.linkNode(BODY.TEST);
		this.limit = BODY.LIMIT && this.linkNode(BODY.LIMIT);
	}

	*execute($) {
		const limit = yield* this.getLimit($);
		const cycleTestStart = Date.now();
		
		let resumeOnce = false;
		while (Date.now() - cycleTestStart <= limit || resumeOnce) {
			const test = Boolean(yield* this.test.doExecution($));
			
			if (test === true) {
				this.output($, 'assert', {
					success: true,
					duration: Date.now() - cycleTestStart
				});
				
				return true;
			} else {
				resumeOnce = yield* this.autowait($.vm, 50);
			}

			resumeOnce = false;
		}
		
		this.output($, 'assert', {
			success: false,
			duration: Date.now() - cycleTestStart
		});

		throw new Error('[LCVM]: Assertion Failure.');
	}
}
register(AssertStatement, 'ASSERT');