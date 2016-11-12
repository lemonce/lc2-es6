/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ACTION',
 * 			TEST: <string | a lc2 expression witch to test>
 * 		}
 * 	}
 */
const Statement = require('../statement');

module.exports = class AssertStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION, BODY});

		this.test = BODY.TEST;
	}
	
	get eventArgs () {
		return {
			type: 'ASSERT',
			args: {
				test: this.test
			}
		};
	}
};
