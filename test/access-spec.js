'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe('ACCESS::', function () {
	it('VARIABLE', () => {
		const vm = new LCVM();
		const syntax = {
			BODY: {
				SYMBOL: 'ACCESS::VARIABLE',
				IDENTIFIER: 'abc'
			}
		};

		assert.equal(vm.run(Statement.linkNode(syntax), {
			abc: 234
		}), 234);
	});

	it('PROPERTY::IDENTIFIER', function () {
		const vm = new LCVM();
		const syntax = {
			BODY: {
				SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
				BASE: {
					BODY: {
						SYMBOL: 'ACCESS::VARIABLE',
						IDENTIFIER: 'object'
					}
				},
				IDENTIFIER: 'test'
			}
		};

		assert.equal(vm.run(Statement.linkNode(syntax), {
			object: {test: 1}
		}), 1);
	});

	it('PROPERTY::EXPRESSION', function () {
		const vm = new LCVM();
		const syntax = {
			BODY: {
				SYMBOL: 'ACCESS::PROPERTY::EXPRESSION',
				BASE: {
					BODY: {
						SYMBOL: 'ACCESS::VARIABLE',
						IDENTIFIER: 'object'
					}
				},
				DESTINATION: {
					BODY: {
						SYMBOL: 'LITERAL::SIMPLE',
						DESTINATION: 'test'
					}
				}
			}
		};

		assert.equal(vm.run(Statement.linkNode(syntax), {
			object: {test: 1}
		}), 1);

	});

	describe('ASSIGNMENT::', function () {
		it('ES= @test = 45', function () {
			const vm = new LCVM();
			const scope = { test: 250 };
			const variableAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::VARIABLE',
							IDENTIFIER: 'test'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 45
						}
					}
				}
			});
			vm.run(variableAssignment, scope);
			assert.equal(45, vm.rootScope.test);
		});

		it('ES= @a[0] = false', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::EXPRESSION',
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
			});

			vm.run(elementAssignment, {
				a: []
			});
			assert.equal(false, vm.rootScope.a[0]);
		});

		it('ES= @a.b = 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: {}
			});
			assert.equal(2, vm.rootScope.a.b);
		});

		it('ES+= @test += 45', function () {
			const vm = new LCVM();
			const scope = { test: 250 };
			const variableAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES+=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::VARIABLE',
							IDENTIFIER: 'test'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 45
						}
					}
				}
			});
			vm.run(variableAssignment, scope);
			assert.equal(295, vm.rootScope.test);
		});
		it('ES+= @a[0] += 54', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES+=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::EXPRESSION',
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
							DESTINATION: 54
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: [32]
			});
			assert.equal(86, vm.rootScope.a[0]);
		});

		it('ES+= @a.b += 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES+=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: { b: 45 }
			});
			assert.equal(47, vm.rootScope.a.b);
		});

		it('ES+= NaN Exception @a.b += 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES+=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.on('error', err => {
				assert.equal('[LCVM]: Invalid operand: NaN.', err.message);
			});

			vm.run(elementAssignment, {
				a: { b: undefined }
			});
		});

		it('ES-= @test -= 45', function () {
			const vm = new LCVM();
			const scope = { test: 250 };
			const variableAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES-=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::VARIABLE',
							IDENTIFIER: 'test'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 45
						}
					}
				}
			});
			vm.run(variableAssignment, scope);
			assert.equal(205, vm.rootScope.test);
		});
		it('ES-= @a[0] -= 54', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES-=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::EXPRESSION',
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
							DESTINATION: 54
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: [32]
			});
			assert.equal(-22, vm.rootScope.a[0]);
		});

		it('ES-= @a.b -= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES-=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: { b: 45 }
			});
			assert.equal(43, vm.rootScope.a.b);
		});

		it('ES-= NaN Exception @a.b -= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES-=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.on('error', err => {
				assert.equal('[LCVM]: Invalid operand: NaN.', err.message);
			});

			vm.run(elementAssignment, {
				a: { b: undefined }
			});
		});
		
		it('ES*= @test *= 45', function () {
			const vm = new LCVM();
			const scope = { test: 2 };
			const variableAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES*=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::VARIABLE',
							IDENTIFIER: 'test'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 45
						}
					}
				}
			});
			vm.run(variableAssignment, scope);
			assert.equal(90, vm.rootScope.test);
		});

		it('ES*= @a[0] *= 54', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES*=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::EXPRESSION',
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
							DESTINATION: 54
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: [2]
			});
			assert.equal(108, vm.rootScope.a[0]);
		});

		it('ES*= @a.b *= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES*=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: { b: 45 }
			});
			assert.equal(90, vm.rootScope.a.b);
		});

		it('ES*= NaN Exception @a.b *= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES*=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.on('error', err => {
				assert.equal('[LCVM]: Invalid operand: NaN.', err.message);
			});

			vm.run(elementAssignment, {
				a: { b: undefined }
			});
		});

		it('ES/= @test /= 45', function () {
			const vm = new LCVM();
			const scope = { test: 45 };
			const variableAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES/=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::VARIABLE',
							IDENTIFIER: 'test'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 45
						}
					}
				}
			});
			vm.run(variableAssignment, scope);
			assert.equal(1, vm.rootScope.test);
		});

		it('ES/= @a[0] /= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES/=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::EXPRESSION',
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
							DESTINATION: 2
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: [54]
			});
			assert.equal(27, vm.rootScope.a[0]);
		});

		it('ES/= @a.b /= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES/=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: { b: 44 }
			});
			assert.equal(22, vm.rootScope.a.b);
		});

		it('ES/= NaN Exception @a.b /= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES/=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.on('error', err => {
				assert.equal('[LCVM]: Invalid operand: NaN.', err.message);
			});

			vm.run(elementAssignment, {
				a: { b: undefined }
			});
		});

		it('ES/= Infinity Exception @a.b /= 0', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES/=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 0
						}
					}
				}
			});

			vm.on('error', err => {
				assert.equal('[LCVM]: Invalid operand: Infinity.', err.message);
			});

			vm.run(elementAssignment, {
				a: { b: 1 }
			});
		});
		
		it('ES%= @test %= 40', function () {
			const vm = new LCVM();
			const scope = { test: 45 };
			const variableAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES%=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::VARIABLE',
							IDENTIFIER: 'test'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 40
						}
					}
				}
			});
			vm.run(variableAssignment, scope);
			assert.equal(5, vm.rootScope.test);
		});

		it('ES%= @a[0] %= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES%=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::EXPRESSION',
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
							DESTINATION: 2
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: [54]
			});
			assert.equal(0, vm.rootScope.a[0]);
		});

		it('ES%= @a.b %= 3', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES%=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 3
						}
					}
				}
			});

			vm.run(elementAssignment, {
				a: { b: 44 }
			});
			assert.equal(2, vm.rootScope.a.b);
		});

		it('ES%= NaN Exception @a.b %= 2', function () {
			const vm = new LCVM();
			const elementAssignment = Statement.linkNode({
				BODY: {
					SYMBOL: 'ES%=',
					LEFT: {
						BODY: {
							SYMBOL: 'ACCESS::PROPERTY::IDENTIFIER',
							BASE: {
								BODY: {
									SYMBOL: 'ACCESS::VARIABLE',
									IDENTIFIER: 'a'
								}
							},
							IDENTIFIER: 'b'
						}
					},
					RIGHT: {
						BODY: {
							SYMBOL: 'LITERAL::SIMPLE',
							DESTINATION: 2
						}
					}
				}
			});

			vm.on('error', err => {
				assert.equal('[LCVM]: Invalid operand: NaN.', err.message);
			});

			vm.run(elementAssignment, {
				a: { b: undefined }
			});
		});
	});
});