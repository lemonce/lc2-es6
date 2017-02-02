const {Statement} = require('es-vm');
const {randexp} = require('randexp');
const moment = require('moment');
const LCScope = require('../scope');
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
	number: num => {
		if(isNaN(num)) {
			throw new Error(`[LCVM]: ${num} can not be converted to number.`);
		}
		return Number(num);
	},
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
	trim: string => String(string).trim(),
	abs: Math.abs,
	ceil: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	format: (dateString, format) => moment(dateString).format(format),
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

	*execute (vm, parentScope) {
		const scope = parentScope.$new();
		const process = vm.processMap && vm.getProcess(this.identifier);
		
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

			try {
				const ret = native[this.identifier].apply(null, args);
				yield vm.writeback(null, ret);				
			} catch (err) {
				vm.writeback(err, null).$halt();
			}

		}
	}
}

module.exports = CallStatement.register('CALL');
