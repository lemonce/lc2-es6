const {ControlStatement} = require('../lc2');
const {Statement, register} = require('es-vm');

class ProcessStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.parameter = Array.prototype.slice.call(BODY.PARAMETER);

		this.segment = this.linkSegment(BODY.SEGMENT);
	}

	*execute($) {
		for (let statement of this.segment) {
			const runtime = statement.doExecution($);
			
			let ret = {}, $done = false;
			while (!$done) {
				const {done, value} =
					ret.err ? runtime.throw(ret.err) : runtime.next(ret.data);

				if (value === 'PROCESS::RETURN') {
					return;
				}
				
				$done = done;

				try {
					ret = {data: yield value};
				} catch (err) {
					ret = {err};
				}
			}
		}
	}
}

class ReturnStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.ret = this.linkNode(BODY.RET);
	}

	*execute($) {
		$.scope['<RETURN>'] = yield* this.ret.doExecution($);

		yield 'PROCESS::RETURN';
	}
}

register(ReturnStatement, 'RETURN');
module.exports = register(ProcessStatement, 'PROCESS');