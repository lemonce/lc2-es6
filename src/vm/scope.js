

class Scope {
	constructor (preset = {}) {
		if (typeof preset !== 'object') {
			throw new Error('[LCVM]: Scope presets is not a object.');
		}
		Object.assign(this, preset);

	}

	get $NOW () { return Date.now(); }
	get $LOOP () {  }

	get $HREF () { }
	get $SCROLL_TOP () { }
	get $SCROLL_LEFT () { }
	get $SCREEN_WIDTH () { }
	get $SCREEN_HEIGHT () { }
}

module.exports = Scope;