'use strict';
const {link, LCVM} = require('../src');
const {Statement, signal} = require('es-vm');
const assert = require('assert');

const blankVM = new LCVM();
describe.only('Array-Statement::', function () {
	const simpleArray = new Statement.map['LITERAL::ARRAY']({
		BODY: {
			SYMBOL: 'LITERAL::ARRAY',
			LIST: [
				{
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 1
					}
				},
				{
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 2
					}
				},
			]
		}
	});

	it('simple-init', function () {
		let ret = blankVM.run(simpleArray);
		assert.deepEqual(ret, [1, 2]);
	});

	it('init-with-expression', function () {
		let ret = blankVM.run(new Statement.map['LITERAL::ARRAY']({
			BODY: {
				SYMBOL: 'LITERAL::ARRAY',
				LIST: [
					{
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 1
						}
					},
					{
						BODY: {
							SYMBOL: 'ES+',
							LEFT: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							RIGHT: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'b'
								}
							}
						}
					}
				]
			}
		}), {
			a: 'c',
			b: 'd'
		});
		assert.deepEqual(ret, [1, 'cd']);
	});

	it('access-by-index', function () {
		let ret = blankVM.run(new Statement.map['ACCESS::PROPERTY']({
			BODY: {
				SYMBOL: 'ACCESS::PROPERTY',
				BASE: {
					BODY: {
						SYMBOL: 'ACCESS::VARIABLE',
						IDENTIFIER: 'a'
					}
				},
				DESTINATION: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 0
					}
				}
			}
		}), {
			a: ['test']
		});
		assert.equal(ret, 'test');

	});

	it('access-by-index-expression-"a[index-2]"', function () {
		let ret = blankVM.run(new Statement.map['ACCESS::PROPERTY']({
			BODY: {
				SYMBOL: 'ACCESS::PROPERTY',
				BASE: {
					BODY: {
						SYMBOL: 'ACCESS::VARIABLE',
						IDENTIFIER: 'a'
					}
				},
				DESTINATION: {
					BODY: {
						SYMBOL: 'ES-',
						LEFT: {
							BODY: {
								SYMBOL: 'ACCESS::VARIABLE',
								IDENTIFIER: 'index'
							}
						},
						RIGHT: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 2
							}
						}
					}
				}
			}
		}), {
			a: ['test', 2, 3, true],
			index: 4
		});
		assert.equal(ret, 3);

	});

	it('Assign-Array-"a[0]=false"', function () {
		const a = [];
		let ret = blankVM.run(new Statement.map['ES=']({
			BODY: {
				SYMBOL: 'ES=',
				LEFT: {
					BODY: {
						SYMBOL: 'ACCESS::PROPERTY',
						BASE: {
							BODY: {
								SYMBOL: 'ACCESS::VARIABLE',
								IDENTIFIER: 'a'
							}
						},
						DESTINATION: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 0
							}
						}
					}
				},
				RIGHT: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: false
					}
				}
			}
		}), {
			a: a
		});
		assert.deepEqual(a, [false]);

	});
	
	it('Assign-Multidimensional-Array-"a[0][3]=false"', function () {
		const a = [[]];
		blankVM.run(new Statement.map['ES=']({
			BODY: {
				SYMBOL: 'ES=',
				LEFT: {
					BODY: {
						SYMBOL: 'ACCESS::PROPERTY',
						BASE: {
							BODY: {
								SYMBOL: 'ACCESS::PROPERTY',
								BASE: {
									BODY: {
										SYMBOL: 'ACCESS::VARIABLE',
										IDENTIFIER: 'a'
									}
								},
								DESTINATION: {
									BODY: {
										SYMBOL: 'LITERAL::SIMPLE',
										DESTINATION: 0
									}
								}
							}
						},
						DESTINATION: {
							BODY: {
								SYMBOL: 'LITERAL::SIMPLE',
								DESTINATION: 3
							}
						}
					}
				},
				RIGHT: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: false
					}
				}
			}
		}), {
			a: a
		});
		assert.deepEqual(a, [[, , , false]]);

	});



});