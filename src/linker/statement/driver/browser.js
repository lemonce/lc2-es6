const DriverStatement = require('../driver');

const browserActionMap = {
	'BROWSER::BACK': 'back',
	'BROWSER::FORWARD': 'forward',
	'BROWSER::REFRESH':'refresh'
};

function BrowserStatementFactory(symbol, method) {
	class BrowserSimpleStatementClass extends DriverStatement {
		constructor ({POSITION}) {
			super({POSITION});
		}
		
		*execute(vm) {
			yield vm.$fetch({method, args: {}});
			yield vm.$writeback(null, true, this.position);
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
	
	*execute(vm) {
		yield* this.url.execute(vm);

		yield vm.$fetch({
			method: 'jumpto',
			args: { url: vm.ret }
		});

		yield vm.$writeback(null, true);
	}
}
JumptoStatement.register('BROWSER::JUMPTO');

class ResizeStatement extends DriverStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.width = this.$linkBySymbol(BODY.WIDTH);
		this.height = this.$linkBySymbol(BODY.HEIGHT);
	}
	
	*execute(vm) {
		yield* this.width.execute(vm);
		const width = vm.ret;

		yield* this.height.execute(vm);
		const height = vm.ret;

		yield vm.$fetch({
			method: 'resize',
			args: { width, height }
		});

		yield vm.$writeback(null, true);
	}
}
ResizeStatement.register('BROWSER::RESIZE');