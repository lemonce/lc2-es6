
const statementClassMap = {};

function linkNode(syntaxNode) {
	return new statementClassMap[syntaxNode.BODY.SYMBOL](syntaxNode);
}

const error = {
	NO_EXECUTE: (symbol) => {
		return `The Statement:${symbol} miss prototype.execute.`;
	}
};

/**
 * The most simple statement looks like:
 * 	{
 * 		[POSITION]: {
 * 			[IDENTIFIER]: <string | the line name user assigned>,
 * 			LINE: <unsigned number | the line of statement in the code>,
 * 			[COL]: <unsigned number | the line of statement in the code>
 * 		}, <object | statement position info from syntax tree>
 * 		BODY: {
 * 			SYMBOL: <string | used to query how to execute>
 * 		} <object | >
 * 	}
 */
class Statement {
	constructor ({POSITION} = {}) {
		this.position = POSITION;
	}

	static register ($Symbol) {
		if (!this.prototype.execute) {
			throw new Error(`[ESVM-DEV]: ${error.NO_EXECUTE($Symbol)}`);
		}
		statementClassMap[$Symbol] = this;
		return this;
	}

	$linkBySymbol (syntaxNode) {
		return linkNode(syntaxNode);
	}

	*doExecution(vm, scope) {
		vm.pushOperation(this);
		yield* this.execute(vm, scope);
		vm.popOperation();
	}
}
Statement.map = statementClassMap;
Statement.linkNode = linkNode;

module.exports = Statement;