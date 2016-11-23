const {Statement} = require('../../esvm/');
const {randexp} = require('randexp');
/**
 * 	{
 * 		BODY: {
 * 			SYMBOL: 'CALL',
 *          IDENTIFIER: <string | process name>,
 * 			ARGUMENTS: [<expression,...>]
 * 		}
 * 	}
 */
const native = {
	number: Number,
	bool: Boolean,
	length: string => string.length,
	charAt: (string, pos) => string.charAt(pos),
	indexOf: (dstSting, testString) => dstSting.indexOf(testString),
	substr: (string, from, length) => string.substr(from, length),
	min: Math.min,
	max: Math.max,
	random: regexp => {
		return regexp ? randexp(regexp) : Math.random();
	},
	abs: Math.abs,
	ceil: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	format: (dateString, format) => {
		//TODO use angular date filter.
	},
	now: Date.now,
};
class CallStatement extends Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.arguments = [];
		for(let statement of BODY.ARGUMENTS) {
			this.arguments.push(this.$linkBySymbol(statement));
		}
	}

	*execute (vm) {
		const scope = vm.rootScope.$new();
		const process = vm.$getProcess(this.identifier);
		
		if (process) {
			const parameterList = process.parameter;
			
			for(let index in this.arguments) {
				yield* this.arguments[index].doExecution(vm, scope);
				scope[parameterList[index]] = vm.ret;
			}
			
			const invoking = process.doExecution(vm, scope);
			vm.pushScope({invoking});
			yield* invoking;
		} else {
			const args = [];
			for(let index in this.arguments) {
				yield* this.arguments[index].doExecution(vm, scope);
				args.push(vm.ret);
			}

			const ret = native[this.identifier].apply(null, args);
			yield vm.writeback(null, ret);
		}
	}
}

module.exports = CallStatement.register('CALL');
