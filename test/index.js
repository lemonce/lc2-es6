const linker = require('../src/linker');
const syntaxTree = {
	BODY: {
		SYMBOL: 'PROCESS',
		IDENTIFIER: 'main',
		SEGMENT: [
			{
				BODY: {
					SYMBOL: 'JUMPTO',
					URL: 'http://baidu.com'
				}
			},
			{
				BODY: {
					SYMBOL: 'ACTION',
					OBJECT: '\"body\"',
					ACTION: 'input',
					PARAMS: {
						value: '\"some text\"'
					}
				}
			},
			{
				BODY: {
					SYMBOL: 'REFRESH'
				}
			},
			{
				BODY: {
					SYMBOL: 'WAIT',
					DELAY: '\"500\"'
				}
			},
			{
				BODY: {
					SYMBOL: 'LOG',
					CONTENT: '\"hello world!\"'
				}
			},
			{
				BODY: {
					SYMBOL: 'CALL',
					IDENTIFIER: 'sub'
				}
			},
			{
				BODY: {
					SYMBOL: 'EXPRESSION',
					EXPRESSION: '\"a = 1;\"'
				}
			},
			{
				BODY: {
					SYMBOL: 'CALL',
					IDENTIFIER: 'sub'
				}
			}
		]
	}
};

const syntaxTreeB = {
	BODY: {
		SYMBOL: 'PROCESS',
		IDENTIFIER: 'sub',
		SEGMENT: [
			{
				BODY: {
					SYMBOL: 'LOG',
					CONTENT: '\"hello world2!\"'
				}
			}
		]
	}
};

const eventEmitter = require('events');
const emitter = new eventEmitter();

emitter.process = {
	main: new linker.PROCESS(syntaxTree),
	sub: new linker.PROCESS(syntaxTreeB)
};
emitter.getProcess = function (identifier) {
	return this.process[identifier];
};



emitter.on('execute', event => {
	console.log(event);
});

emitter.on('call', event => {
	console.log(event);
});

for(let value of emitter.getProcess('main').execute(emitter));

