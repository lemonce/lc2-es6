/**
 * RPC::Request
 */
class Request {
	/**
	 * @param {Object} invoking
	 * @param {String} invoking.method
	 * @param {Object} invoking.args
	 */
	constructor(invoking) {
		this.$token = Symbol(invoking.method);
		this.invoking = invoking;
	}

	get token () {
		return this.$token;
	}
}

/**
 * RPC::Response
 */
class Response {
	/**
	 * @param {Request} request
	 * @param {*} data
	 */
	constructor(request, data, ret) {
		if (!(request instanceof Request)) {
			throw new Error('[LCVM]: Invalid rpc request.');
		}

		/**
		 * The token inherit from request.
		 * 
		 * @property token
		 * @type {Symbol}
		 * @public
		 */
		this.token = request.token;

		/**
		 * The token inherit from request.
		 * 
		 * @property data
		 * @type {Symbol}
		 * @public
		 */
		this.data = data;

		this.ret = ret;
	}
}

exports.Request = Request;
exports.Response = Response;