const {Statement} = require('es-vm');

class ESConditionStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.condition = this.$linkBySymbol(BODY.CONDITION);
		this.true = this.$linkBySymbol(BODY.TRUE);
		this.false = this.$linkBySymbol(BODY.FALSE);
	}
	
	*execute($) {
		const condition = yield* this.condition.doExecution($);

		return yield* this[Boolean(condition)].doExecution($);
	}
}
ESConditionStatement.register('ES?:');