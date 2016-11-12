const Emitter = require('events');

class Watchdog extends Emitter {
	constructor () {
		super ();

		this.lifeId = null;
		this.isWatching = false;
		this.checkTime = 0;
		this.limit = 0;
	}

	work () {
		this.lifeId = setInterval(() => {

		}, 100);
	}

	rest () {
		clearInterval(this.lifeId);
	}

	watch (limit, wakeFn = () => {}) {
		this.isWatching = true;
		this.checkTime = Date.now();
		this.wakeFn = wakeFn;
	}

	wake () {
		this.wakeFn();
		this.emit('waking');
		this.isWatching = false;
	}

	cancelWatch () {
		this.isWatching = false;
	}
}

module.exports = Watchdog;