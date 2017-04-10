const {LC2Statement} = require('../lc2');
const {randexp} = require('randexp');
const dateFormat = require('dateformat');

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
	format: (date, format) => dateFormat(date, format),
	now: Date.now,
};

class CallStatement extends LC2Statement {
	constructor ({POSITION, BODY}) {
		super({POSITION});

		this.identifier = BODY.IDENTIFIER;
		this.arguments = this.linkSegment(BODY.ARGUMENTS || []);
	}

	*iterateArgument($, callback) {
		for(let index in this.arguments) {
			callback(index, yield* this.arguments[index].doExecution($));
		}
	}

	*execute($) {
		const parentScope = $.scope;
		const childScope = parentScope.$new();
		const process = $.vm.processMap && $.vm.getProcess(this.identifier);

		const $$ = {vm: $.vm, scope: childScope};
		
		if (process) {
			const parameterList = process.parameter;
			
			yield* this.iterateArgument($$, (index, ret) => {
				childScope[parameterList[index]] = ret;
			});
			
			return parentScope['<CHILD_RETURN>'] = yield* process.doExecution($$);
		} else {
			const args = [];
			yield* this.iterateArgument($$, (index, ret) => {
				args.push(ret);
			});

			return native[this.identifier].apply(null, args);
		}
	}
}
CallStatement.native = native;

module.exports = CallStatement.register('CALL');
