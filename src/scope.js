const {Scope} = require('es-vm');

class LCScope extends Scope {
	constructor(parentScope = new LCScope(), presets) {
		super(presets);
		if(parentScope instanceof LCScope) {
			Object.setPrototypeOf(this, parentScope);
		} else {
			this.extend(parentScope);
		}

		this.$button = 'left';
		this.$offsetX = '50%';
		this.$offsetY = '50%';
		this.$it = null;
	}



	set $BUTTON(val) {
		const button = ['left', 'middle', 'right'];
		if(button.indexOf(val) === -1) {
			throw new Error(`[LCVM]: Invalid $BUTTON value: ${val}`);
		}
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
		if(!/^\d+(px|%)$/.test(val)) {
			throw new Error(`[LCVM]: Invalid $OFFSET_X value: ${val}`);
		}
		this.$offsetX = val;
	}

	get $OFFSET_X() {
		return this.$offsetX;
	}

	set $OFFSET_Y(val) {
		if(!/^\d+(px|%)$/.test(val)) {
			throw new Error(`[LCVM]: Invalid $OFFSET_Y value: ${val}`);
		}
		this.$offsetY = val;
	}

	get $OFFSET_Y() {
		return this.$offsetY;
	}
}

module.exports = LCScope;