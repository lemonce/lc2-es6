'use strict';
const Emitter = require('events');
const Watchdog = require('./watchdog');
const {Request, Response} = require('./rpc');
const signal = require('./signal');
const Statement = require('./statement');

const signalForKernel = {
	WAITING_ASYNC_RESPONSE: {
		interception: true
	},
	ERROR_HALTING: {
		interception: true
	},
	EXITING: {},
	EXECUTING: {},
	BLOCKED: {
		interception: true
	},
	IDLE: {},
	BOOTING: {
		launching: true,
	},
};

for(let tag in signalForKernel) {
	signal.register(tag, signalForKernel[tag]);
}

const RPC_LIMIT = 30;
const WATCHDOG_CYCLE = 50;
/**
 * [L]emon[C]ase [V]isual [M]achine
 * 
 * A VM used to run async/sync programe by ECMAScript 
 * engine. It provide RPC, Watchdog, Statement and Scope
 * to help to design a execution tree.
 * 
 * @extends Emitter
 */
class Kernel extends Emitter {

	constructor() {
		super();

		/**
		 * @property $watchdog
		 * @type {Watchdog}
		 */
		this.$watchdog = new Watchdog();

		/**
		 * To store a token when a async RPC request occur.
		 * Use to check if expired or not in LCVM.respond().
		 * 
		 * @property rpcToken
		 * @type {Symbol}
		 */
		this.rpcToken = null;
		this.signal = signal.get('IDLE');
		this.$runtime = null;

		this.ret = null;
		this.position = null;

		/*eslint-disable no-console */
		this.on('error', err => console.log(`[ESVM-DEV]: ${err.message}`));
		/*eslint-enable no-console */
	}

	/**
	 * Get a instruction to send to remote.
	 * Making VM to blocked.
	 * 
	 * @param {Object} invoking Method name & arguments.
	 * @param {String} invoking.method name
	 * @param {Object} invoking.args
	 */
	fetch(invoking, limit = RPC_LIMIT) {
		if (this.signal !== signal.get('EXECUTING')) {
			throw new Error('[ESVM]: Invalid signal.');
		}

		// Set event listener in external (invoking, vm)
		this.signal = signal.get('WAITING_ASYNC_RESPONSE');
		this.$watchdog.watch(limit, () => {
			const message = '[ESVM]: No-response from last fetching.';
			this.rpcToken = null;
			this.writeback(new Error(message), 1);
		});

		// Create a token & build to Request.
		// The token will be checked when responding.
		const request = new Request(invoking);
		this.rpcToken = request.token;
		this.emit('fetch', request, this);

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
		// Invalid response.
		if (!(response instanceof Response)) {
			const message = '[ESVM-DEV]: Invalid RPC Response.';
			this.emit('error', new Error(message));
			return;
		}

		// Expired response.
		if (response.token !== this.rpcToken || this.signal === signal.get('IDLE')) {
			const message = '[ESVM]: The RPC response is expired.';
			this.emit('warning', new Error(message));
			return;
		}

		// Make the LCVM continue to run.
		this.$watchdog.cancelWatch();
		this.emit('respond', response.data);
		this.ret = response.ret;
		setImmediate(() => this.$run());

		return this;
	}

	/**
	 * Do with error & enter a new cycle.
	 * @param {Error} err Exception from statement or respond.
	 * @param {any} ret The result of the last operation.
	 * @param {Object} position The position in code from compiler.
	 */
	writeback(err, ret) {
		if (err) {
			this.signal = signal.get('ERROR_HALTING');
			this.emit('error', err);
		}

		this.emit('writeback', err, this.ret = ret, this.position);
		return this;
	}

	loadProgram(statement) {
		if (!(statement instanceof Statement)) {
			throw new Error('[ESVM-DEV]: Invalid statement.');
		}
		this.$runtime = statement.doExecution(this);
	}

	$launch() {
		if (this.$runtime === null) {
			throw new Error('[ESVM]: No-program in vm.');
		}

		if (this.signal.launching === false) {
			throw new Error(`[ESVM]: Can not $launch vm from signal:${this.signal.tag}`);
		}

		this.$watchdog.work(WATCHDOG_CYCLE);
		this.rpcToken = null;
		this.emit('programe-start', this);
		this.$run();
	}

	$bootstrap() {
		if (this.signal !== signal.get('IDLE')) {
			throw new Error('[ESVM]: VM must boot from signal:IDLE.');
		}

		this.emit('bootstrap-start', this);
		this.signal = signal.get('BOOTING');
		this.emit('bootstrap-end', this);

		return this;
	}

	$run() {
		this.signal = signal.get('EXECUTING');
		for(let tick of this.$runtime) {
			if (this.signal.interception) {
				if (this.signal === signal.get('ERROR_HALTING')) {
					break;
				}
				return tick;
			}
		}

		this.$halt();
		this.emit('program-end', this);
		return this;
	}

	$halt() {
		this.$runtime = null;
		this.signal = signal.get('IDLE');
		this.$watchdog.rest();

		return this;
	}

	$block() {
		this.signal = signal.get('BLOCKED');
		return this;
	}
}

exports.Kernel = Kernel;