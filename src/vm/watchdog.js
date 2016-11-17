const Emitter = require('events');

class Watchdog extends Emitter {
	constructor () {
		super ();

		this.cycle = 100;
		this.lifeId = null;
		this.isWatching = false;
		this.checkTime = 0;
	}

	work(cycle = 100) {
		this.rest();
		this.lifeId = setInterval(() => {
			if (this.isWatching) {
				if (Date.now() > this.checkTime) {
					this.wake();
				}
			}
		}, this.cycle = cycle);
	}

	rest () {
		clearInterval(this.lifeId);
		this.lifeId = null;
	}

	watch (limit, wakeFn = () => {}) {
		this.isWatching = true;
		this.checkTime = Date.now() + Math.max(limit, this.cycle);
		this.wakeFn = wakeFn;
	}

	wake () {
		this.emit('waking', this.wakeFn());
		this.cancelWatch();
	}

	cancelWatch () {
		this.isWatching = false;
	}
}

module.exports = Watchdog;