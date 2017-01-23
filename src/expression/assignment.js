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
				yield vm.writeback(null, doOperation(operation, scope, this.identifier, vm.ret));	
			} catch (err) {
				vm.writeback(err, null).$halt();
			}
		}
	}

	return AssignmentStatementClass.register(symbol);
}

function doOperation(operation, scope, identifier, ret) {
	const val = operation(scope, identifier, ret);

	if(typeof val === 'number' && !isFinite(val)) {
		throw new Error(`[LCVM]: Invalid operand: ${val}.`);
	}

	return val;
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