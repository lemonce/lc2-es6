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
	}

	loopEnd(err, ret) {
		this.emit('loop-end', err, ret, this);

		this.loop += 1;
		if (this.loop < this.options.times) {
			this.$setTimeout(() => {
				this.callMainProcess();
			}, this.options.interval);
		} else {
			this.caseEnd(err, ret);
		}
	}

	caseEnd (err, ret) {
		this.$runtime = null;
		this.$state = 'ready';
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

	callMainProcess() {
		this.$loadProgram(callMain, {
			scope: this.rootScope = new LCScope()
		});
		this.$launch();

		return this;
	}

	get state() { return this.$state; }
	start() {
		this.$state = 'running';

		this.$setTimeout(() => {
			this.callMainProcess();
		}, this.options.interval);

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