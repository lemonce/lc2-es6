'use strict';
const signalMap = {};
exports.register = (tag, {interception = false, launching = false}) => {
	if (signalMap.hasOwnProperty(tag)) {
		throw new Error(`[ESVM-DEV]: signal in tag:${tag} has been existed.`);
	}

	const signal = signalMap[tag] = {tag};
	signal.interception = interception;
	signal.launching = launching;
	return;
};

exports.get = (tag) => {
	if (!signalMap.hasOwnProperty(tag)) {
		throw new Error(`[ESVM-DEV]: No signal matched by tag:${tag}`);
	}

	return signalMap[tag];
};
