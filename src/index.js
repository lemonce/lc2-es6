// Control statement requirement.
const Process = require('./control/process');
require('./control/branch');
require('./control/loop');

// Expression
require('./expression/binary'); // 15ES + 2LC
require('./expression/access'); // 5ES + var + property
require('./expression/literal');
require('./expression/logic'); // ES! ES&& ES||
require('./expression/condition'); // ES?:

// Native
require('./native/call');
require('./native/log');
require('./native/wait');
require('./native/assert');

// Driver
require('./driver/selector'); // LC7 <* />
require('./driver/browser');
require('./driver/mouse');
require('./driver/keyboard');

/**
 * 	{
 * 		processMap: {},
 * 		options: {}
 * 	}
 * 
 * @exports link
 * @param {Object} syntaxTree 
 */
exports.link = function link({processMap, options, global}) {
	for(let identifier in processMap) {
		processMap[identifier] = new Process(processMap[identifier]);
	}

	return {processMap, options, global};
};

exports.LCVM = require('./lcvm').LCVM;

exports.config = require('./config');