'use strict';

const settings = {
	MAX_RPC_LIMIT: 300,
};

exports.set = function (key, value) {
	return settings[key] = value;
};

exports.get = function (key) {
	return settings[key];
};