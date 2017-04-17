const {Statement, register} = require('es-vm');

class ESConditionStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.condition = this.linkNode(BODY.CONDITION);
		this.true = this.linkNode(BODY.TRUE);
		this.false = this.linkNode(BODY.FALSE);
	}
	
	*execute($) {
		const condition = yield* this.condition.doExecution($);

		return yield* this[Boolean(condition)].doExecution($);
	}
}
register(ESConditionStatement, 'ES?:');