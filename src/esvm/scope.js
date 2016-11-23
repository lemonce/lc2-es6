


class Scope {
	constructor(presets) {
		this.extend(presets);
	}

	$new(presets) {
		const childScope = new Scope(presets);
		Object.setPrototypeOf(childScope, this);
		return childScope;
	}

	extend(object) {
		Object.assign(this, object);
	}
}

exports.Scope = Scope;