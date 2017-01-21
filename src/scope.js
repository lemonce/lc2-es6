const {Scope} = require('es-vm');

class LCScope extends Scope {
	constructor(presets) {
		super(presets);
		this.$button = 'left';
		this.$offsetX = '50%';
		this.$offsetY = '50%';
		this.$it = null;
	}

	set $BUTTON(val) {
		this.$button = val;
	}

	get $BUTTON() {
		return this.$button;
	}

	set $IT(val) {
		this.$it = val;
	}

	get $IT() {
		return this.$it;
	}

	set $OFFSET_X(val) {
		this.$offsetX = val;
	}

	get $OFFSET_X() {
		return this.$offsetX;
	}

	set $OFFSET_Y(val) {
		this.$offsetY = val;
	}

	get $OFFSET_Y() {
		return this.$offsetY;
	}
}

module.exports = LCScope;