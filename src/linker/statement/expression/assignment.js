const Statement = require('../statement');

function AssignmentStatementFactory(symbol, operation) {
	class AssignmentStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});

			this.identifier = BODY.IDENTIFIER;
			this.sources = this.$linkBySymbol(BODY.SOURCES);
		}
		
		*execute(vm, scope) {
			yield* this.sources.execute(vm, scope);
			yield vm.$writeback(null, operation(scope, this.identifier, vm.ret), this.position);
		}
	}

	return AssignmentStatementClass.register(symbol);
}

const operationSymbolMap = {
	'ES=': (scope, identifier, sources) => scope[identifier] = sources,
	'ES+=': (scope, identifier, sources) => scope[identifier] += sources,
	'ES-=': (scope, identifier, sources) => scope[identifier] -= sources,
	'ES*=': (scope, identifier, sources) => scope[identifier] *= sources,
	'ES/=': (scope, identifier, sources) => scope[identifier] /= sources,
	'ES%=': (scope, identifier, sources) => scope[identifier] %= sources
};

for(let symbol in operationSymbolMap) {
	AssignmentStatementFactory(symbol, operationSymbolMap[symbol]);
}
module.exports = AssignmentStatementFactory;