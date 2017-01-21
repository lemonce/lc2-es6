const {Statement} = require('es-vm');

function AssignmentStatementFactory(symbol, operation) {
	class AssignmentStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});

			this.identifier = BODY.IDENTIFIER;
			this.sources = this.$linkBySymbol(BODY.SOURCES);
		}
		
		*execute(vm, scope) {
			yield* this.sources.doExecution(vm, scope);
			try {
				const ret = operation(scope, this.identifier, vm.ret);

				if(typeof ret === 'number' && !isFinite(ret)) {
					throw new Error(`Invalid operand: ${ret}.`);
				}
				
				yield vm.writeback(null, ret);	
			} catch (err) {
				vm.writeback(err, null).$halt();
			}
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