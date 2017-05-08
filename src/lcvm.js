const {ESVM, Statement, linkNode} = require('es-vm');
const LCScope = require('./scope');
const CallStatement = require('./native/call');
const callMain = new CallStatement({BODY: {IDENTIFIER: 'main', ARGUMENTS: []}});

const defaultOptions = {
	strict: false,
	wait: 500,
	limit: 5000,
	times: 1,
	interval: 3000,
	screen: {
		width: null,
		height: null
	}
};

class LCVM extends ESVM {
	constructor({processMap, options = {}, global} = {}) {
		super();
		
		this.processMap = processMap;
		this.options = Object.assign({}, defaultOptions, options);
		this.rootScope = new LCScope();
		this.loop = 0;

		this.on('program-end', (err, ret) => {
			this.loopEnd(err, ret);
		});
		
		this.on('program-start', () => {
			const loop = this.loop;
			Object.assign(this.rootScope, {
				get $LOOP() { return loop; }
			});

			global && global.forEach(statement => {
				const run = linkNode(statement).doExecution({vm: this, scope: this.rootScope});
				for(let tick of run);
			});
		});

		this.$suspending = false;
		this.$suspended = false;
	}

	loopEnd(err, ret) {
		this.emit('loop-end', err, ret, this);

		this.loop += 1;
		if (this.loop < this.options.times) {
			this.start();
		} else {
			this.loop = 0;
			this.caseEnd(err, ret);
		}
	}

	caseEnd (err, ret) {
		this.$runtime = null;
		this.emit('case-end', err, ret, this);
	}

	/**
	 * @method $getProcess
	 * @param {String} identifier The identifier of a Process.
	 * @return {ProcessStatement}
	 */
	getProcess(identifier) {
		return this.processMap[identifier];
	}

	run(executionNode, scope) {
		this.$loadProgram(executionNode, {
			scope: Object.assign(this.rootScope, scope)
		});
		
		return this.$run();
	}

	loadProcessMain() {
		this.$loadProgram(callMain, {
			scope: this.rootScope = new LCScope()
		});

		return this;
	}

	get state() {
		if (this.$runtime === null) {
			return 'ready';
		}

		if (this.$runtime && this.$suspending && !this.$suspended) {
			return 'suspending';
		}

		if (this.$runtime && !this.$suspending && this.$suspended) {
			return 'suspended';
		}

		if (this.$runtime && !this.$suspending && !this.$suspended) {
			return 'running';
		}

		return 'unknown';
	}

	start() {
		this.loadProcessMain().$setTimeout(() => {
			this.$launch();
		}, this.options.interval);

		return this;
	}

	resume() {
		if (this.state !== 'suspended') {
			throw new Error(`The status is not 'suspended' but '${this.state}'.`);
		}

		this.$suspended = false;
		this.$run();

		return this;
	}

	stop() {
		this.$halt();
		this.$suspending = false;
		this.$suspended = false;

		return this;
	}

	pause() {
		if (this.state !== 'running') {
			throw new Error(`The status is not 'running' but '${this.state}'.`);
		}

		this.$suspending = true;

		return this;
	}
}

exports.LCVM = LCVM;