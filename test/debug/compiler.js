const {parse, parseAt} = require('lc2-compiler');
const {link, LCVM} = require('../../src');
const code = `

#AUTOWAIT 500
#TIMES 2;
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
		click 'div#' + a;
		c = <@'div#'+a/>;
	} else {
		a = random(/[0-9a-z]{40}/);
	}

	getUsername('fff');
	pass = 'abc';
	getUsername(pass);
	return 'success:' + a;
}

process getUsername(pass) {
	if (pass !== 'fff') {
		name = 'fff' + 3456;
		return name;
	}

	return pass + 'dddd';
}
		`;
const syntaxTree = parse(code);
const executionTree = link(syntaxTree);
const vm2 = new LCVM(executionTree);
vm2.on('writeback', (err, ret, {start, end}) => {
	console.log(ret, code.substring(start, end));
});
vm2.on('loop-end', vm => {
	// assert.equal(vm.ret, false);
});
vm2.on('case-end', vm => {
	// done();
});
vm2.on('fetch', rpc => {
	rpc.async(() => {
		return new Promise(resolve => setTimeout(resolve, 100));
	});
});
vm2.start();