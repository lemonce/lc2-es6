const {ControlStatement} = require('../lc2');
const {Statement} = require('es-vm');

class ProcessStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.parameter = Array.from(BODY.PARAMETER);

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

ReturnStatement.register('RETURN');
module.exports = ProcessStatement.register('PROCESS');