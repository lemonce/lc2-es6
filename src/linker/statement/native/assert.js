const Statement = require('../statement');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ACTION',
 * 			TEST: <string | a lc2 expression witch to test>
 * 		}
 * 	}
 */

class AssertStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.test = BODY.TEST;
	}
	
	*execute() {
		yield;
	}
}
module.exports = AssertStatement;