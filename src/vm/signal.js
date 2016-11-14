
const signal = {
	// Programe signal
	WAITING_ASYNC_RESPONSE: Symbol.for('WAITING_ASYNC_RESPONSE'),
	ERROR_HALTING: Symbol.for('ERROR_HALTING'),
	EXECUTING: Symbol.for('EXECUTING'),
	BLOCKED: Symbol.for('BLOCKED'),
	RETURN: Symbol.for('RETURN'),
	BREAKPOINT: Symbol.for('BREAKPOINT'),

	// VM signal
	IDLE: Symbol.for('IDLE'),
	BOOTING: Symbol.for('BOOTING')
};

module.exports = signal;