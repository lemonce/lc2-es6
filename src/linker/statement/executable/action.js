/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'ACTION',
 * 			OBJECT: <string | a lc2 expression about csspath>,
 * 			ACTION: <string | identifer of actions that driver supported>,
 * 			PARAMS: <object | action args>
 * 		}
 * 	}
 */
const Statement = require('../statement');
module.exports = class ActionStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION, BODY});

		this.action = BODY.ACTION;
		this.object = BODY.OBJECT;
		this.params = BODY.PARAMS;
	}

	get eventArgs () {
		return {
			type: 'ACTION',
			args: {
				action: this.action,
				object: this.object,
				params: this.params
			}
		}
	}
};
