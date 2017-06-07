const {Statement} = require('es-vm');
const config = require('./config');

class LC2Statement extends Statement {
	*autowait(vm, wait = vm.options.wait) {
		if (vm.$suspending) {
			vm.$suspending = false;
			vm.$suspended = true;

			vm.$clearAllTimeout();
			vm.emit('suspended', vm);

			yield 'VM::BLOCKED';

			return true;
		}

		if (isNaN(wait)) {
			throw new Error('[LCVM] timeout get a NaN argument, a number ms excepted.');
		}

		if (wait >= 0) {
			yield vm.$setTimeout(() => vm.$run(), wait);
			yield 'VM::BLOCKED';
		}

		return false;
	}

	*getLimit($) {
		let limit = $.vm.options.limit;
		if (this.limit) {
			limit = yield* this.limit.doExecution($);
		}

		return limit;
	}

	output($, type, data) {
		$.vm.emit('driver', {
			type,
			data: Object.assign({
				position: this.position
			}, data)
		});
	}
	
	linkSegment(segment) {
		if (!Array.isArray(segment)) {
			throw new Error('[LCVM-DEV]: Invalid segment.');
		}

		const linkedSegment = [];

		segment.forEach(statement => {
			linkedSegment.push(this.linkNode(statement));
		});

		return linkedSegment;
	}
}

class DriverStatement extends LC2Statement {

	/**
	 * Get the selector of a statement and update it to $IT.
	 * If selector from statement is empty, use $IT instead.
	 * @param {Object} context
	 */
	*getSelector($) {
		if (this.selector) {
			const selector = yield* this.selector.doExecution($);

			return $.scope.$IT = selector;
		}
		
		if(!$.scope.$IT) {
			throw new Error('[LCVM]: Empty selector founded.');
		}

		return $.scope.$IT;
	}

	*autoRetry(vm, limit, args) {
		const start = Date.now();
		
		while (Date.now() - start <= limit) {
			try {
				yield vm.fetch(args, config.get('MAX_RPC_LIMIT'));
				
				return Date.now() - start;
			} catch (err) {
				yield* this.autowait(vm, 50);
				continue;
			}
		}

		throw new Error('Driver action request failed.');
	}
}

class ControlStatement extends LC2Statement {
	// *executeSegment($, segment, callback) {
	// 	for (let statement of segment) {
	// 		const statementRuntime = statement.doExecution($);
	// 		let ret, $done = false;
			
	// 		while (!$done) {
	// 			const {done, value} = statementRuntime.next(ret);

	// 			if(callback(value)) {
	// 				break;
	// 			}
				
	// 			$done = done;
	// 			ret = yield value;
	// 		}
	// 	}

	// }
}

exports.ControlStatement = ControlStatement;
exports.DriverStatement = DriverStatement;
exports.LC2Statement = LC2Statement;