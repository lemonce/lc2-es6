/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'REFRESH'
 * 		}
 * 	}
 */
const Statement = require('../statement');
module.exports = class RefreshStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION, BODY});
	}

	get eventArgs () {
		return {
			type: 'REFRESH',
			args: {}
		};
	}
};

