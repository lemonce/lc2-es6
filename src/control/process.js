const {ControlStatement} = require('../lc2');
const {Statement, register} = require('es-vm');

class ProcessStatement extends ControlStatement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.parameter = Array.from(BODY.PARAMETER);
		this.segment = this.linkSegment(BODY.SEGMENT);

		// lexical.
		this.lexicalScope = null;
		this.vm = null;
	}

	*call({runtimeArguments, context}) {
		const $ = {
			vm: this.vm,
			scope: this.lexicalScope.$new(runtimeArguments),
			context
		};

		try {
			for (let statement of this.segment) {
				yield* statement.doExecution($);
			}
		} catch (signal) {
			if (signal.type === 'return') {
				return signal.data;
			}

			throw signal;
		}
	}
	
	*execute($) {
		this.lexicalScope = $.scope;
		this.vm = $.vm;

		return new ProcessRuntimeObject(this.identifier, this);
	}
}

class CallProcessStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.accessor = this.linkNode(BODY.ACCESSOR);
		this.arguments = this.linkSegment(BODY.ARGUMENTS);
	}

	*execute($) {
		// Get process statement from context.
		const {base, context} = yield* this.accessor.getBase($);
		const destination = yield* this.accessor.getDestination($);
		const process = base[destination];

		if (!(process instanceof LC2Process)) {
			throw new Error('[LCVM] This is not a process for calling.');
		}

		// Compute arguments.
		const parameterList = process.parameter;
		const runtimeArguments = {};
		
		for(let index in this.arguments) {
			runtimeArguments[parameterList[index]] =
				yield* this.arguments[index].doExecution($);
		}
		
		return yield* process.statement.call({
			runtimeArguments,
			context
		});
	}
}

class ReturnProcessStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.ret = this.linkNode(BODY.RET);
	}

	*execute($) {
		throw {
			type: 'return',
			data:  yield* this.ret.doExecution($)
		};
	}
}

register(CallProcessStatement, 'PROCESS::CALL');
register(ReturnProcessStatement, 'PROCESS::RETURN');
register(ProcessStatement, 'PROCESS::SEGMENT');