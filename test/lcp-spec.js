const {parse, parseAt} = require('lc2-compiler');
const {link, LCVM} = require('../src/lcvm');
const {Statement, Response, Resquest, signal} = require('../src/esvm/');
const assert = require('assert');

describe('Testing with compiler::', function () {
	this.timeout(10000);

	const vm = new LCVM();
	vm.on('[loop]', vm => {
		// console.log(vm.ret==='false');
	});
	const code = [
		'1+2',
		'2-1',
		'4/2',
		'5*6',
		'4%5',
		'1<2',
		'1<="1"',
		'1>2',
		'1>=2',
		'1==2',
		'1===1',
		'1!=1',
		'1!==1',
		'1==="1"',
		'random()',
		'1',
		'a=1',
		'a+=1',
		'a-=1',
		'a*=1',
		'a/=1',
		'a%=1',
		'"abc"~~"bc"',
		'"abc"!~"bc"',
		'length("444")',
		'number("23")',
		'/[a-z0-9]{16}/',
		'random(/[a-z0-9]{16}/)',
		'1&&1',
		'1||1',
		'!1',
		'if (true) {0;} else {1;}',
		'1?2:3',
		'while (false) {2;a+=1;}',

		// 'process main () {}',
	]

	it('Sync code', function () {
		code.forEach(str => {
			const node = parseAt(str);
			let ret = vm.run(Statement.linkNode(node));
		});
	});

	it('Async operation with driver', function (done) {
		const code = `
#TIMES 1
#INTERVAL 3000
#AUTOWAIT 500
#LIMIT	2000

process main () {
	a = 1 + 1;
	wait 1000;
	click 'body a';
	return 'success';
}
		`;
		const syntaxTree = parse(code);
		const executionTree = link(syntaxTree);
		const vm2 = new LCVM(executionTree);
		vm2.on('loop-end', vm => {
			assert.equal(vm.ret, 'success');
		});
		vm2.on('case-end', vm => {
			done();
		});
		vm2.on('writeback', (err, ret, {start, end}) => {
			console.log(ret, code.substring(start, end));
		});
		vm2.on('fetch', (req, vm, Response) => {
			setTimeout(() => {
				vm.respond(new Response(req));
			}, 1500);
		});
		vm2.start();
	});

	it('Complex code', function (done) {
		const code = `
#AUTOWAIT 500
#TIMES 1;
#INTERVAL 999;
#SCREEN 1,2
#LIMIT

process main () {
	// a = random();
	sub_1("23", /[a-z0-9]{16}/);
	1 ? 2 : 3;
	1 ~~ 2 !~ 3;
	1 || 2 && 3;
	!1;
	selector = "button";
	time = true;
	click ".btnG";
	input selector by "1";
	input "input" by /test\d{4}/img;
	input "input" by /[/]/;
	input "input" by selector + 1;
	rclick time ;
	dblclick selector ;
	movein selector ;
	moveout time ;
	//assert "null";
	assert <@"sth"/> in 00000;
	//assert selector in 3000;
	log "yes";
	console "fuck\\\' \\"off";
	1 + 2;
	return 'success';
}
process sub_1 (str, reg){
	log str + reg;
}
		`;
		const syntaxTree = parse(code);
		const executionTree = link(syntaxTree);
		const vm2 = new LCVM(executionTree);
		vm2.on('writeback', (err, ret) => {
			console.log(err === null, ret);
		});
		vm2.on('loop-end', vm => {
			assert.equal(vm.ret, false);
		});
		vm2.on('case-end', vm => {
			done();
		});
		vm2.on('fetch', (req, vm, Response) => {
			setTimeout(() => {
				vm.respond(new Response(req));
			}, 100);
		});
		vm2.start();
	});
	
	it('while code', function (done) {
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
}
		`;
		const syntaxTree = parse(code);
		const executionTree = link(syntaxTree);
		const vm2 = new LCVM(executionTree);
		vm2.on('writeback', (err, ret, pos) => {
			console.log(err, ret, pos);
		});
		vm2.on('loop-end', vm => {
			// assert.equal(vm.ret, false);
		});
		vm2.on('case-end', vm => {
			done();
		});
		vm2.on('fetch', (req, vm, Response) => {
			setTimeout(() => {
				vm.respond(new Response(req));
			}, 100);
		});
		vm2.start();
	});
});