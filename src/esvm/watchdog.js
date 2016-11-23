const Emitter = require('events');

class Watchdog extends Emitter {
	constructor ({cycle = 100} = {}) {
		super ();

		this.cycle = cycle;
		this.lifeId = null;
		this.isWatching = false;
		this.checkTime = 0;
	}

	work(cycle) {
		this.rest();
		this.lifeId = setInterval(() => {
			if (this.isWatching) {
				if (Date.now() > this.checkTime) {
					this.$wake();
				}
			}
		}, cycle || this.cycle);
	}

	rest () {
		clearInterval(this.lifeId);
		this.lifeId = null;
	}

	watch (limit, wakeFn = () => {}) {
		if (typeof limit !== 'number') {
			throw new Error('[ESVM -> Watchdog::watch(limit,...)]: Invalid.');
		}
		this.isWatching = true;
		this.checkTime = Date.now() + Math.max(limit, this.cycle);
		this.wakeFn = wakeFn;
	}

	$wake () {
		this.emit('waking', this.wakeFn());
		this.cancelWatch();
	}

	cancelWatch () {
		this.isWatching = false;
	}
}

module.exports = Watchdog;