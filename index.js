const {link, LCVM} = require('./src');
const {Statement} = require('es-vm');
module.exports = {
	linkNode: Statement.linkNode,
	link, LCVM
};