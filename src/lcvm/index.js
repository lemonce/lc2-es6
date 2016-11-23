// Control statement requirement.
const Process = require('./control/process');
require('./control/branch');
require('./control/loop');

// Expression
require('./expression/value');
require('./expression/binary'); // 15ES + 2LC
require('./expression/assignment'); // 5ES
require('./expression/not'); // ES!
require('./expression/condition'); // ES?:
require('./expression/selector'); // LC7 <* />

// Native
const CallStatement = require('./native/call');
require('./native/log');
require('./native/return');
require('./native/wait');
require('./native/assert');

// Driver
require('./driver/browser');
require('./driver/mouse');
require('./driver/keyboard');


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

exports.LCVM = require('./lcvm').LCVM;