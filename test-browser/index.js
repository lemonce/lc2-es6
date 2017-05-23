require('mocha/mocha');
require('mocha/mocha.css');

window.onload = function () {
	mocha.setup({
		ui: 'bdd',
		timeout: 99999
	});

	require('./code-spec');

	mocha.run();
};