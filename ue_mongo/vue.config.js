const devServer = { proxy: {} }
const VUE_APP_BASE_URL = process.env.VUE_APP_BASE_URL ? process.env.VUE_APP_BASE_URL : ''

//代理auth请求
devServer.proxy[`${process.env.VUE_APP_BACK_AUTH_BASE}`] = { target: process.env.VUE_APP_BACK_AUTH_SERVER }
//代理base api请求
devServer.proxy[`${process.env.VUE_APP_BACK_API_BASE}`] = { target: process.env.VUE_APP_BACK_API_SERVER }
devServer.proxy[`${process.env.VUE_APP_BACK_API_PLUGIN}`] = { target: process.env.VUE_APP_BACK_API_SERVER }

module.exports = {
  publicPath: `${VUE_APP_BASE_URL}/`,
	outputDir: `dist${VUE_APP_BASE_URL}/`,
	devServer,
	pages: {
		index: {
				entry: "src/main.js",
				template: "public/index.html",
				title: process.env.VUE_APP_TITLE,
				chunks: ["chunk-vendors", "chunk-common", "index"]
		},
	}
}
