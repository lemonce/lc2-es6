const Emitter = require('events');
const Scope = require('./scope');
const Watchdog = require('./watchdog');
const {callMainProcess} = require('../linker/statement/executable/call');
const {Request, Response} = require('./rpc');

const signal = {
	WAITING_ASYNC_RESPONSE: Symbol('WAITING_ASYNC_RESPONSE'),
	ERROR_HALTING: Symbol('ERROR_HALTING'),
	EXECUTING: Symbol('EXECUTING'),
	BLOCKED: Symbol('BLOCKED'),
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

/**
 * @class LCMV
 * 
 * [L]emon[C]ase [V]isual [M]achine
 */
class LCVM extends Emitter {
	
	constructor({processMap, options = {}, root}, callback = () => { }) {
		super();

		/**
		 * @property $watchdog
		 * @type {Watchdog}
		 */
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

		this.on('error', err => console.log(err.message));
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

	/**
	 * Get a instruction to send to remote.
	 * Making VM to blocked.
	 * @param {Object} invoking Method name & arguments.
	 * @param {String} invoking.method name
	 * @param {Object} invoking.args
	 */
	$fetch(invoking) {
		// Set event listener in external (invoking, vm)
		this.signal = signal.WAITING_ASYNC_RESPONSE;
		this.$watchdog.watch(3000, () => {
			const message = '[LC2]: No response from last fetching.';
			this.$writeback(new Error(message), null);
		});

		// Create a token & build to Request.
		// The token will be checked when responding.
		const request = new Request(invoking);
		this.emit('$fetch', request, this);
		this.rpcToken = request.token;

		return this;
	}

	/**
	 * Receive response from remote.
	 * Continue the VM.
	 * 
	 * @param {Response} response The result of calling from remote asynchronously.
	 * @return {Case}
	 */
	respond(response) {
		//TODO check token
		this.$watchdog.cancelWatch();
		this.emit('$respond', response);
		this.$$run();

		return this;
	}

	/**
	 * Do with error & enter a new cycle.
	 * @param {Error} err Exception from statement or respond.
	 * @param {any} ret The result of the last operation.
	 * @param {Object} position The position in code from compiler.
	 */
	$writeback(err, ret, position) {
		if (err) {
			this.emit('error', err);
			this.signal = signal.ERROR_HALTING;
		}

		this.emit('$writeback', err, this.ret = ret, position);
		return this;
	}

	/**
	 * @param {String} identifier The identifier of a Process.
	 */
	$getProcess(identifier) {
		return this.processMap[identifier];
	}

	$bootstrap() {
		this.signal = signal.BOOTING;
		this.rootScope = new Scope();
		this.emit('booting', this);

		this.$runtime = this.mainProcessInvoking.execute(this);
		this.$watchdog.work();
		this.$$run();

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
		this.$runtime = null;
		this.emit('loop-end', this);
	}

	$caseEnd () {
		this.emit('case-end', this);
	}

	$$run() {
		this.signal = signal.EXECUTING;
		for(let tick of this.$runtime) {
			// console.log(`[tick]: ${tick}`);
			if (this.signal === signal.BLOCKED) {
				return tick;
			}

			if (this.signal === signal.WAITING_ASYNC_RESPONSE) {
				return tick;
			}

			if (this.signal === signal.ERROR_HALTING) {
				return this.$loopEnd();
			}
		}

		return this.$loopEnd();
	}

	$block() {
		this.signal = signal.BLOCKED;
		return this;
	}
}

module.exports = LCVM;