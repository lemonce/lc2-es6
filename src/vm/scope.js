


class Scope {
	$new() {
		const childScope = new Scope();
		Object.setPrototypeOf(childScope, this);
		return childScope;
	}
}

class RootScope extends Scope {
	constructor(presets) {
		super();

		this.extend(presets);
	}

	extend(object) {
		Object.assign(this, object);
	}
}

exports.Scope = Scope;
exports.RootScope = RootScope;