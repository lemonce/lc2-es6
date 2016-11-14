const LCVMKernel = require('./kernel');
class LCVM extends LCVMKernel {
	constructor(...options) {
		super(...options);

		this.$state = 'ready';
		this.$breakpointMap = {};
	}

	get state() {
		return this.$state;
	}

	setBreakpoint(line, witch = true) {
		this.$breakpointMap[line] = witch;
		return this;
	}

	clearBreakpoint() {
		this.$breakpointMap = {};
		return this;
	}

	debug() {

	}

	step() {

	}

	start() {

	}

	pause() {

	}

	resume() {

	}

	stop() {

	}
}

LCVM.controlSignal = {
	CONTROL_SUSPEND: Symbol('CONTROL_SUSPEND')
};

module.exports = LCVM;