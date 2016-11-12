/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'WAIT',
 *          LOG: <string | lc2 expression about content>
 * 		}
 * 	}
 */
const Statement = require('../statement');

module.exports = class LogStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION, BODY});

		this.content = BODY.CONTENT;
	}

	get eventArgs () {
		return {
			type: 'LOG',
			args: {
				content: this.content
			}
		};
	}
};
