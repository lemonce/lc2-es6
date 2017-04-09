const {DriverStatement} = require('../lc2');

class UploadStatement extends DriverStatement {
	constructor({POSITION, BODY}) {
		super({POSITION});

		this.fileList = this.$linkBySymbol(BODY.FILE_LIST);
	}

	*execute($) {
		yield* this.autowait($.vm);

		const fileList = yield* this.fileList.doExecution($);

		if(!Array.isArray(fileList)) {
			throw new Error('[LCVM]: Upload statement except [<string>,...].');
		}

		yield $.vm.fetch({
			method: 'doUpload',
			args: {fileList}
		}, yield* this.getLimit($));

		this.output($, 'action', {
			action: 'upload',
			success: true,
			param: fileList
		});

		return true;
	}
}

UploadStatement.register('ACTION::UPLOAD');