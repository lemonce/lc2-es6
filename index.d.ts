/**
 * link syntax tree
 */
export function link(syntaxTree: object): object;
/**
 * virtual machine instance
 */
export class LCVM {
	processMap: object;
	options: object;
	loop: number;

	run(executionNode: object, scope?: object): any;
	on(event: eventName, callback: (...arg) => void): void;
};

const eventName = 'loop-end'
	| 'case-end'
	| 'fecth'
	| 'writeback'
	| '[loop]'
	| 'log';
