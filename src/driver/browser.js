const {DriverStatement} = require('../lc2');
const config = require('../config');

const browserActionMap = {
	'BROWSER::BACK': 'back',
	'BROWSER::FORWARD': 'forward',
	'BROWSER::REFRESH': 'refresh'
};

function BrowserStatementFactory(symbol, method) {
	class BrowserSimpleStatementClass extends DriverStatement {
		constructor ({POSITION}) {
			super({POSITION});
		}
		
		*execute($) {
			yield $.vm.fetch({method, args: {}}, config.get('MAX_RPC_LIMIT'));
			
			this.output($, method);

			return true;
		}
	}
	BrowserSimpleStatementClass.register(symbol);
}

for(let symbol in browserActionMap) {
	BrowserStatementFactory(symbol, browserActionMap[symbol]);
}

class JumptoStatement extends DriverStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.url = this.$linkBySymbol(BODY.URL);
	}
	
	*execute($) {
		const url = yield* this.url.doExecution($);

		yield $.vm.fetch({
			method: 'jumpto',
			args: { url }
		}, config.get('MAX_RPC_LIMIT'));

		this.output($, 'jumpto', {url});

		return true;
	}
}
JumptoStatement.register('BROWSER::JUMPTO');

class ResizeStatement extends DriverStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.width = this.$linkBySymbol(BODY.WIDTH);
		this.height = this.$linkBySymbol(BODY.HEIGHT);
	}
	
	*execute($) {
		const width = yield* this.width.doExecution($);
		const height = yield* this.height.doExecution($);

		yield $.vm.fetch({
			method: 'resize',
			args: { width, height }
		});

		return true;
	}
}
ResizeStatement.register('BROWSER::RESIZE');