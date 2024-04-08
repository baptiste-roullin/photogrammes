const path = require("path")
const util = require('node:util')
const exec = util.promisify(require('node:child_process').exec)
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img")

module.exports = function (config) {
	/**
	 * Opts in to a full deep merge when combining the Data Cascade.
	 * Per the link below, "This will likely become the default in an upcoming major version."
	 * So I'm going to implement it now.
	 * @link https://www.11ty.dev/docs/data-deep-merge/#data-deep-merge
	 */
	config.setDataDeepMerge(true)

	/**
	* Custom Watch Targets
	* for when the Tailwind config or .css files change...
	* by default not watched by 11ty
	* @link https://www.11ty.dev/docs/config/#add-your-own-watch-targets
	*/

	const { readdir, stat } = require('fs/promises')


	config.addWatchTarget('./src/assets/css/')
	config.addWatchTarget('./src/assets/scripts/')
	config.addWatchTarget('./src/*.js')
	config.setWatchThrottleWaitTime(200)

	config.setWatchJavaScriptDependencies(true)

	config.addPassthroughCopy('src/assets/')
	config.setUseGitIgnore(false)

	config.addCollection("sortedSnaps", async function () {

		async function gettingCommitedDate(basePath, fileName) {
			const { name } = fileName
			const command = `git log -1 --pretty=\"format:%ct\" \"${basePath}\/${name}\"`
			try {
				const { stdout } = await exec(command)
				return {
					name,
					time: Number(stdout)
				}
			} catch (e) {
				if (e instanceof Error) {
					console.log(new Error(`Failed executing ${command} with ${e.message}`))
				}
				const metadata = await stat(`${basePath}/${name}`)
				return {
					name,
					time: metadata.mtime.getTime()
				}
			}
		}

		function onlyImages(file) {

			const isImage = new RegExp(/\.(png|jpg|jpeg|gif|webp)$/g)
			if (isImage.test(file.name)) {
				return true
			}
		}

		try {
			const basePath = 'src/assets/images/'
			const dir = await readdir(basePath, { withFileTypes: true })
			return (
				await Promise.all(dir
					.map(fileName => gettingCommitedDate(basePath, fileName))
				)).filter(onlyImages)
				.sort((a, b) => a.time - b.time)
				//returning only the name
				.map(file => file.name)
				.reverse()

		} catch (err) {
			console.error(err)
		}

	})



	config.addPlugin(eleventyImageTransformPlugin, {
		// which file extensions to process
		extensions: "html",
		urlPath: "assets/images",
		filenameFormat: function (id, src, width, format, options) {
			const extension = path.extname(src)
			const name = path.basename(src, extension)
			return name + '.webp'
		},
		formats: ["webp"],
		sharpWebpOptions: {
			quality: 90
		},
		widths: ["auto"],
		defaultAttributes: {
			alt: "",
			loading: "lazy",
			decoding: "async",
		},
	})




	return {
		dir: {
			input: 'src',
			output: 'dist',
			includes: '_templates',
			data: '_data',
		},
		passthroughFileCopy: true,
		templateFormats: ['njk'],
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',
	}
}