'use strict';
const Emitter = require('events');
const {RootScope} = require('./scope');
const Watchdog = require('./watchdog');
const {callMainProcess} = require('../linker/');
const {Request, Response} = require('./rpc');
const signal = require('./signal');

const defaultOptions = {
	strict: false,
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
 * [L]emon[C]ase [V]isual [M]achine
 * 
 * A VM used to run async/sync programe by ECMAScript 
 * engine. It provide RPC, Watchdog, Statement and Scope
 * to help to design a execution tree.
 * 
 * @extends Emitter
 */
class LCVMKernel extends Emitter {

	/**
	 * Use to modify VM manually after construction.
	 * 
	 * @callback LCVMFactoryCallback
	 * @param {LCVM} vm The LCVM constructing.
	 */
	
	/**
	 * Create a LCVM
	 * 
	 * @param {Object} executionTree - The executionTree object.
	 * @param {Object} executionTree.processMap - All processes mapping object.
	 * @param {Object} executionTree.options - Some options to VM.
	 * @param {LCVMFactoryCallback} callback - Do something after construction.
	 */
	constructor({processMap, options = {}}, callback = () => {}) {
		super();

		/**
		 * @property $watchdog
		 * @type {Watchdog}
		 */
		this.$watchdog = new Watchdog();

		/**
		 * @property signal
		 * @type {Symbol}
		 */
		this.processMap = processMap;
		this.options = Object.assign(options, defaultOptions);

		/**
		 * To store a token when a async RPC request occur.
		 * Use to check if expired or not in LCVM.respond().
		 * 
		 * @property rpcToken
		 * @type {Symbol}
		 */
		this.rpcToken = null;
		this.signal = signal.IDLE;
		this.$runtime = null;
		this.rootScope = null;
		this.loop = 0;
		this.callingStack = [];

		callback(this);

		/*eslint-disable no-console */
		this.on('error', err => console.log(`[LCVM-DEV]: ${err.message}`));
		/*eslint-enable no-console */
	}

	/**
	 * Get a instruction to send to remote.
	 * Making VM to blocked.
	 * 
	 * @param {Object} invoking Method name & arguments.
	 * @param {String} invoking.method name
	 * @param {Object} invoking.args
	 * @fires LCVM#$fetch
	 */
	$fetch(invoking) {
		// Set event listener in external (invoking, vm)
		this.signal = signal.WAITING_ASYNC_RESPONSE;
		this.$watchdog.watch(3000, () => {
			const message = '[LCVM]: No-response from last fetching.';
			this.rpcToken = null;
			this.$writeback(new Error(message), 1);
		});

		// Create a token & build to Request.
		// The token will be checked when responding.
		const request = new Request(invoking);

		/**
		 * $fetch event
		 * 
		 * @event LCVM#$fetch
		 * @type {Object}
		 */
		this.emit('fetch', request, this);
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
		// Invalid response.
		if (!(response instanceof Response)) {
			const message = '[LCVM-DEV]: Invalid RPC Response.';
			this.emit('error', new Error(message));
			return;
		}

		// Expired response.
		if (response.token !== this.rpcToken) {
			const message = '[LCVM]: The last RPC is expired.';
			this.emit('error', new Error(message));
			this.rpcToken = null;
			return;
		}

		// Make the LCVM continue to run.
		this.$watchdog.cancelWatch();
		this.emit('$respond', response.data);
		this.ret = response.ret;
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
	 * @method $getProcess
	 * @param {String} identifier The identifier of a Process.
	 * @return {ProcessStatement}
	 */
	$getProcess(identifier) {
		//TODO get std function or process.
		return this.processMap[identifier];
	}

	$lanuch() {
		const loop = this.loop;
		this.rootScope = new RootScope({
			get $LOOP () {
				return loop;
			}
		});
		this.$runtime = callMainProcess.execute(this);
		this.$$run();
		this.emit('loop-start', this.rootScope);
	}

	$bootstrap() {
		this.signal = signal.BOOTING;
		this.emit('booting', this.rootScope);
		this.$watchdog.work();

		this.$lanuch();

		return this;
	}

	pushScope(scopeObject) {
		this.callingStack.push(scopeObject);
		return this;
	}

	popScope() {
		this.callingStack.pop();
		return this;
	}

	$loopEnd () {
		this.$runtime = null;
		this.emit('loop-end', this);

		this.loop += 1;
		if (this.loop < this.options.times) {
			this.$lanuch();
		} else {
			this.$caseEnd();
		}
	}

	$caseEnd () {
		this.signal = signal.IDLE;
		this.$watchdog.rest();

		this.$runtime = null;
		this.emit('case-end', this);
	}

	$$run() {
		this.signal = signal.EXECUTING;
		for(let tick of this.$runtime) {
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

module.exports = LCVMKernel;