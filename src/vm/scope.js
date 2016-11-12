

class Scope {
	constructor () {

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