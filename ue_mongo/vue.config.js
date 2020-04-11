const VUE_APP_BASE_URL = process.env.VUE_APP_BASE_URL ? process.env.VUE_APP_BASE_URL : ''

module.exports = {
  publicPath: `${VUE_APP_BASE_URL}/`,
  outputDir: `dist${VUE_APP_BASE_URL}/`,
	pages: {
		index: {
				entry: "src/main.js",
				template: "public/index.html",
				title: process.env.VUE_APP_TITLE,
				chunks: ["chunk-vendors", "chunk-common", "index"]
		},
	}
}
