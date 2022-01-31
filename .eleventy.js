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

	const { readdir, stat } = require('fs/promises');


	config.addWatchTarget('./src/assets/css/')
	config.addWatchTarget('./src/assets/scripts/')
	config.addWatchTarget('./src/*.js')
	config.setWatchThrottleWaitTime(200);

	config.setWatchJavaScriptDependencies(true);

	config.addPassthroughCopy('src/assets/')
	config.setUseGitIgnore(false)

	config.addCollection("sortedSnaps", async function () {

		try {
			const basePath = 'src/assets/images/'
			const dir = await Promise.all(await readdir(basePath, { withFileTypes: true }))

			return (await Promise.all(dir.map(async (fileName) => {
				const { name } = fileName
				const metadata = await stat(`${basePath}/${name}`);

				return {
					name,
					time: metadata.mtime.getTime()
				}
			}
			))).filter((file) => {

				const isImage = new RegExp(/\.(png|jpg|jpeg|gif|webp)$/g)
				if (isImage.test(file.name)) {
					return true
				}
			}).sort((a, b) => a.time - b.time).map(file => file.name).reverse()


		} catch (err) {
			console.error(err);
		}

	});



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