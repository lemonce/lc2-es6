
const statementClassMap = {};

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
	constructor ({POSITION}) {
		this.position = POSITION;
	}

	get eventArgs () {
		return { type: 'ABSTRACT', args: {} };
	}

	*execute (vm) {
		yield vm.$writeback(null);
	}
	
	static register ($Symbol) {
		statementClassMap[$Symbol] = this;
		return this;
	}

	static linkBySymbol (syntaxNode) {
		return new statementClassMap[syntaxNode.BODY.SYMBOL](syntaxNode);
	}

}

module.exports = Statement;