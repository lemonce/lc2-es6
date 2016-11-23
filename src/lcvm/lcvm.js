const {ESVM, Scope, signal, Statement} = require('../esvm');

const defaultOptions = {
	strict: false,
	globalWait: 500,
	globalLimit: 5000,
	times: 1,
	interval: 3000,
	screen: {
		width: null,
		height: null
	}
};

class LCVM extends ESVM {
	constructor({processMap, options = {}} = {}) {
		super();
		
		this.processMap = processMap;
		this.options = Object.assign({}, defaultOptions, options);
		this.rootScope = new Scope();
		this.loop = 0;
		this.callingStack = [];
		this.$breakpointMap = {};

		this.on('program-end', () => this.loopEnd());
		this.on('program-start', () => {
			const loop = this.loop;
			this.rootScope = new Scope({
				get $LOOP () { return loop; }
			});

		});
	}
	
	pushScope(scopeObject) {
		this.callingStack.push(scopeObject);
		return this;
	}

	popScope() {
		this.callingStack.pop();
		return this;
	}

	loopEnd () {
		this.emit('loop-end', this);

		this.signal = signal.get('BLOCKED');
		//TODO program

		this.loop += 1;
		if (this.loop < this.options.times) {
			setTimeout(() => this.$lanuch(), this.options.interval);
		} else {
			this.caseEnd();
		}
	}

	caseEnd () {
		this.signal = signal.IDLE;
		this.$watchdog.rest();

		this.$runtime = null;
		this.emit('case-end', this);
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
		Object.assign(this.rootScope, scope);
		this.loadProgram(executionNode);
		this.$run();

		return this.ret;
	}
	
	loadProgram(statement) {
		if (!(statement instanceof Statement)) {
			throw new Error('[ESVM-DEV]: Invalid statement.');
		}
		this.$runtime = statement.doExecution(this, this.rootScope);
	}
}

exports.LCVM = LCVM;