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
require('./expression/log');
require('./expression/wait');
require('./expression/assert');

// Driver
require('./driver/selector'); // LC7 <* />
require('./driver/browser');
require('./driver/mouse');
require('./driver/keyboard');
require('./driver/upload');

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