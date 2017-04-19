
//Math
//Date
//Number
//Boolean
//Array
//Object
//describe
//it
const {Process} = require('./datatype');
const {Statement} = require('es-vm');

function generateNativeMethod(identifier, call) {
	const nativeStatement = new Statement();
	nativeStatement.call = call;

	return new Process(identifier, nativeStatement);
}

const native = {
	describe: generateNativeMethod('describe', function* ($) {
		
	})
};