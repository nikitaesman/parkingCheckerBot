/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

const nodeExternals = require('webpack-node-externals')

const isDev = process.env.NODE_ENV === 'development'

if(!isDev) {
	console.log("\nProduction build starting")
}

console.log("isDev: ",isDev)

module.exports = {
	target: 'async-node',
	externals: [nodeExternals()],
	context: path.resolve(__dirname,'src'),
	entry: './server.ts',
	output: {
		filename: 'server.js',
		path: path.resolve('dist'),
		clean: true
	},
	resolve: {
		extensions: ['.js', '.ts'],
		preferRelative: true,
		modules: [path.resolve('./src'), 'node_modules'],
		alias: {
			'@websocket': path.resolve(__dirname,'./src/websocket/websocketServer')
		},
	},
	watchOptions: {
		ignored: ['node_modules'],
	},
	module: {
		rules: [
			// all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.([cm]?ts)$/, loader: "ts-loader" }
		]
	}
}

