const {Statement} = require('es-vm');
class DriverStatement extends Statement {

	/**
	 * Get the selector of a statement and update it to $IT.
	 * If selector from statement is empty, use $IT instead.
	 * @param {Statement} driver
	 * @param {scope} scope
	 */
	selectElement(driver, scope) {
		if(!driver.selector && !scope.$IT) {
			throw new Error('[LCVM-DEV]: Empty selector founded.');
		}

		driver.selector = driver.selector || driver.$linkBySymbol({
			BODY: {
				SYMBOL: 'LITERAL',
				DESTINATION: scope.$IT
			}
		});

		scope.$IT = driver.selector.destination;
		return driver.selector;
	}
}

module.exports = DriverStatement;