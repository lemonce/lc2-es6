const Kernel = require('./kernel');
const signal = require('./signal');

signal.register('CONTROL_SUSPEND', {
	interception: true,
});

signal.register('CONTROL_STOP', {
	interception: true,
});

class ESVM extends Kernel {
	constructor(options) {
		super(options);

		this.$state = 'ready';
	}

	get state() {
		return this.$state;
	}

	debug() {

	}

	step() {

	}

	start() {
		this.$bootstrap();
		this.$state = 'running';
		return this;
	}

	pause() {
		this.$state = 'suspend';
		this.signal = signal.get('CONTROL_SUSPEND');
		return this;
	}

	resume() {
		this.$state = 'running';
		this.$$run();
		return this;
	}

	stop() {
		this.$state = 'ready';
		return this;
	}
}

exports.ESVM = ESVM;