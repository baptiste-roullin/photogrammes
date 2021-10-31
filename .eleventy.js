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
	config.addWatchTarget('./src/assets/css/')
	config.addWatchTarget('./src/assets/scripts/')
	config.addWatchTarget('./src/*.js')
	config.addWatchTarget('./tailwind.config.js')
	config.setWatchThrottleWaitTime(200);

	config.setWatchJavaScriptDependencies(true);

	config.addPassthroughCopy('src/assets/')
	config.addPassthroughCopy('src/robots.txt')
	config.setUseGitIgnore(false)

	return {
		dir: {
			input: 'src',
			output: 'dist',
			includes: '_templates',
			data: '_data',
		},
		passthroughFileCopy: true,
		templateFormats: ['html', 'njk', 'md'],
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',
	}
}