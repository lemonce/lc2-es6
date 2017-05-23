const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './test-browser/index.js',
	module: {
		loaders: [
			{
				test: /\.css$/,
				include: /node_modules/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /compiler\S+\.js/,
				include: /node_modules/,
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