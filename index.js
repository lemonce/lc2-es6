const {link, LCVM} = require('./src/lcvm');
const {Statement} = require('./src/esvm');
module.exports = {
	linkNode: Statement.linkNode,
	link, LCVM
};