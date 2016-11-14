const Emitter = require('events');

class Watchdog extends Emitter {
	constructor () {
		super ();

		this.lifeId = null;
		this.isWatching = false;
		this.checkTime = 0;
		this.limit = 0;
	}

	work(cycle = 100) {
		this.lifeId = setInterval(() => {
			if (this.isWatching) {
				if (Date.now() > this.checkTime + this.limit) {
					this.wake();
				}
			}
		}, cycle);
	}

	rest () {
		clearInterval(this.lifeId);
	}

	watch (limit, wakeFn = () => {}) {
		this.isWatching = true;
		this.limit = limit;
		this.checkTime = Date.now();
		this.wakeFn = wakeFn;
	}

	wake () {
		this.emit('waking', this.wakeFn());
		this.isWatching = false;
	}

	cancelWatch () {
		this.isWatching = false;
	}
}

module.exports = Watchdog;