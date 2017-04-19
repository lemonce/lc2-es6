const {ESVM} = require('es-vm');
const native = require('./native');
const LCScope = require('./scope');
const {EvaluateStatement} = require('./control/evaluate');

class LCVM extends ESVM {
	constructor() {
		super();
		
		this.rootScope = new LCScope();
		this.on('program-end', (err, ret) => {
			this.caseEnd(err, ret);
		});
	}

	get state() { return this.$state; }

	caseEnd(err, ret) {
		this.$state = 'ready';
		this.emit('case-end', err, ret, this);
	}

	evaluate(raw) {
		this.$loadProgram(new EvaluateStatement({
			RAW: raw,
			POSITION: {
				//TODO
			}
		}), {
			scope: this.rootScope = new LCScope()
		});

		this.$launch();

		return this;
	}

	start(raw) {
		this.$state = 'running';
		this.evaluate(raw);

		return this;
	}

	resume() {
		this.$state = 'running';
		this.$run();

		return this;
	}

	stop() {
		this.$halt();
		this.$state = 'ready';

		return this;
	}
}

exports.LCVM = LCVM;