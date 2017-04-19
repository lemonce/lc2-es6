const {ControlStatement} = require('../lc2');
const {register, Statement} = require('es-vm');
const {parse} = require('lc2-compiler');

class EvaluateStatement extends ControlStatement {
	constructor({RAW, POSITION}) {
		super({POSITION});

		this.raw = RAW;
	}

	*execute($) {
		const segment = parse(this.raw);

		for(let statement of segment) {
			yield* statement.doExecution($);
		}
	}
}

class ImportStatement extends Statement {
	constructor({BODY, POSITION}) {
		super({POSITION});

		this.map = BODY.MAP;
		this.path = BODY.PATH;
	}

	*execute($) {

	}
}

class ExportStatement extends Statement {
	constructor({POSITION}) {
		super({POSITION});

	}

	*execute($) {

	}
}

register(ImportStatement, 'IMPORT');
register(ExportStatement, 'EXPORT');
exports.EvaluateStatement = register(EvaluateStatement, 'EVALUATE');