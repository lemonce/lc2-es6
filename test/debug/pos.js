const {parse, parseAt} = require('lc2-compiler');
const {link, LCVM, config} = require('../../src');

console.log(config.get('MAX_RPC_LIMIT'));

const code = `
#AUTOWAIT 500
#TIMES 1;
#INTERVAL 999;
#SCREEN 1,2
#LIMIT

process main () {
	index = 0;
	while(index<5) {
		b = 'b' + index;
		index+=1;
	}

	if (b === 'b4') {
		a = random(/[0-9a-z]{16}/);
	} else {
		a = random(/[0-9a-z]{40}/);
	}
	return 'success:' + a;
}`;
const syntaxTree = parse(code);
const executionTree = link(syntaxTree);
const vm2 = new LCVM(executionTree);
vm2.on('loop-end', vm => {
	// assert.equal(vm.ret, 'success');
});
vm2.on('case-end', vm => {
	// done();
});
vm2.on('writeback', (err, ret, {start, end} = {}) => {
	console.log(ret, '[CODE]: ' + `${code.substring(start, end)}`);
});
vm2.on('fetch', (req, vm, Response) => {
	setTimeout(() => {
		vm.respond(new Response(req));
	}, 1500);
});
vm2.start();