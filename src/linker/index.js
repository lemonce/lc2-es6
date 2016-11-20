// Control statement requirement.
const Process = require('./statement/control/process');
require('./statement/control/branch');
require('./statement/control/loop');

// Expression
require('./statement/expression/value');
require('./statement/expression/binary'); // 15ES + 2LC
require('./statement/expression/assignment'); // 5ES
require('./statement/expression/not'); // ES!
require('./statement/expression/condition'); // ES?:
require('./statement/expression/selector'); // LC7 <* />

// Native
const CallStatement = require('./statement/native/call');
require('./statement/native/log');
require('./statement/native/return');
require('./statement/native/wait');
require('./statement/native/assert');

// Driver
require('./statement/driver/browser');
require('./statement/driver/mouse');
require('./statement/driver/keyboard');


/**
 * 	{
 * 		processList: [],
 * 		options: {}
 * 	}
 * 
 * @exports link
 * @param {Object} syntaxTree 
 */
exports.link = function link(syntaxTree) {
	const processMap = {};
	const options = syntaxTree.options;

	syntaxTree.forEach(syntaxProcess => {
		processMap[syntaxProcess.BODY.IDENTIFIER] = new Process(syntaxProcess);
	});

	return {processMap, options};
};

exports.callMainProcess = new CallStatement({
	BODY: {
		IDENTIFIER: 'main',
		ARGUMENTS: []
	}
});
exports.Statement = require('./statement/statement');