const Emitter = require('events');
const Scope = require('./scope');
const Watchdog = require('./watchdog');
const {callMainProcess} = require('../linker/statement/executable/call');

const signal = {
	WAITING_ASYNC_RESPONSE: Symbol('WAITING_ASYNC_RESPONSE'),
	EXECUTING: Symbol('EXECUTING'),
	RETURN: Symbol('RETURN'),

	IDLE: Symbol('IDLE'),

	CHECKING: Symbol('CHECKING'),
	BOOTING: Symbol('BOOTING'),
};

const defaultOptions = {
	blockWait: 5000,
	busyWait: 500,
	times: 1,
	interval: 3000,
	screen: {
		width: null,
		height: null
	},
	breakpoint: []
};

class Case extends Emitter {
	
	constructor({processMap, options = {}, root}, callback = () => { }) {
		super();

		this.$watchdog = new Watchdog();

		this.signal = signal.IDLE;
		this.processMap = processMap;
		this.options = Object.assign(options, defaultOptions);

		this.$runtime = null;
		this.rootScope = new Scope(root);
		this.loop = 0;
		this.mainProcessInvoking = callMainProcess;
		this.callingStack = [];

		callback(this);

		// Get a instruction to send to remote
		// Making VM to blocked.
		this.on('$fetch', () => {
			// Set event listener in external (invoking, vm)
			this.signal = signal.WAITING_ASYNC_RESPONSE;
			this.$watchdog.watch(5000, () => {
				this.$writeback(new Error('[LC2]: No response from last fetching.'));
			});
		});

		// Receive response from remote
		// Continue the VM
		this.on('$respond', response => {
			//TODO check signal
			this.signal = signal.EXECUTING;
			this.$watchdog.cancelWatch();
			this.clock(response);
		});

		// Do with error & enter a new cycle.
		this.on('$writeback', (err, ret) => {
			if (err) {
				this.emit('error', err);
				//TODO restart runtime
				return;
			}
			this.ret = ret;
			this.clock();
		});
	}

	get isReturn () {
		return this.signal === signal.RETURN;
	}

	$setExecuting() {
		this.signal = signal.EXECUTING;
		return this;
	}

	$setReturn() {
		this.signal = signal.RETURN;
		return this;
	}

	$fetch(invoking) {
		this.emit('$fetch', invoking, this);
		return this;
	}

	respond(response = null) {
		this.emit('$respond', response);
		return this;
	}

	$writeback(err, ret, position) {
		this.emit('$writeback', err, ret, position);
		return this;
	}

	$getProcess(identifier) {
		return this.processMap[identifier];
	}

	$bootstrap() {
		this.signal = signal.BOOTING;
		this.rootScope = new Scope();
		this.emit('booting', this);

		this.$runtime = this.mainProcessInvoking.execute(this);
		this.signal = signal.EXECUTING;
		this.clock();

		return this;
	}

	$check() {
		this.signal = signal.CHECKING;
		this.emit('checking', this);
	}

	setScope (dataset) {

	}

	pushScope(scopeObject) {
		this.callingStack.push(scopeObject);
		return this;
	}

	popScope() {
		const scopeObject = this.callingStack.pop();
		return this;
	}

	$loopEnd () {
		// this.$setScope();
		this.signal = signal.IDLE;
		this.emit('loop-end', this);
	}

	$caseEnd () {
		this.emit('case-end', this);
	}

	clock(...args) {
		setImmediate(() => {
			const ret = this.$runtime.next(...args);
			if (ret.done) {
				this.$loopEnd();
			}
		});
	}

}

module.exports = Case;