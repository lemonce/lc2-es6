const {Statement, register} = require('es-vm');
const config = require('../config');

const methodSymbolMap = {
	'LC<!': 'isDisplay',
	'LC<#': 'getLength',
	'LC<@': 'getText',
	'LC<-': 'getWidth',
	'LC<|': 'getHeigth',
	'LC<<': 'getLeft',
	'LC<^': 'getTop',
};

function SelectorStatementFactory(symbol, method) {
	
	class SelectorStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});
			this.selector = this.linkNode(BODY.SELECTOR);
		}
		
		*execute($) {
			const selector = yield* this.selector.doExecution($);
			
			try {
				return yield $.vm.fetch({method,
					args: {selector}
				}, config.get('MAX_RPC_LIMIT'));
			} catch (err) {
				return null;
			}
		}
	}

	register(SelectorStatementClass, symbol);
}

for(let symbol in methodSymbolMap) {
	SelectorStatementFactory(symbol, methodSymbolMap[symbol]);
}