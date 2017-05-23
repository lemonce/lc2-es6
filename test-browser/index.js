require('mocha/mocha');
require('mocha/mocha.css');
require('core-js/shim');

window.onload = function () {
	mocha.setup({
		ui: 'bdd',
		timeout: 99999
	});

	require('../test/access-spec');
	require('../test/binary-spec');
	require('../test/condition-spec');
	require('../test/control-spec');
	require('../test/literal-spec');
	require('../test/logic-spec');
	require('../test/native-spec');

	mocha.run();
};