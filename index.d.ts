/**
 * link syntax tree
 */
export function link(syntaxTree: Object): Object;
/**
 * virtual machine instance
 */
export class LCVM {
	options: Object;
	loop: number;

	run(executionNode: Object, scope?: Object): any;
	on(event: eventName, callback: (...arg) => void): void;
}

type eventName = 'loop-end'
	| 'case-end'
	| 'fecth'
	| 'writeback'
	| '[loop]'
	| 'log';
