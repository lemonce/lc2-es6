const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './test-browser/index.js',
	module: {
		rules: [
			{
				test: /\.css$/,
				include: /node_modules/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.js$/,
				loader: 'babel-loader'
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './test-browser/browser.html',
			filename: 'index.html',
			inject: 'head'
		})
	],
};