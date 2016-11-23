const ESVM = require('./src/vm');
const linker = require('./src/linker');
module.exports = Object.assign({}, ESVM, { linker });