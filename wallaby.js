module.exports = () => {
	return {
		files: [
			'src/**/*.js',
		],
		tests: [
			'test/*-spec.js'
		],
		debug: true,
		env: {
			type: 'node'
		},
		testFramework: 'mocha'
	};
};