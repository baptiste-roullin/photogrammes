import path from "path"
import util from 'node:util'
import { exec } from 'node:child_process'
import murmurhash from 'murmurhash'
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img"
import slugify from '@sindresorhus/slugify'

import { readdir, stat } from 'node:fs/promises'

const pExec = util.promisify(exec)

export default async function (config) {

	config.setDataDeepMerge(true)



	config.addWatchTarget('./src/assets/css/')
	config.addWatchTarget('./src/assets/scripts/')
	config.addWatchTarget('./src/assets/UI/')

	config.addWatchTarget('./src/*.js')
	config.setWatchThrottleWaitTime(200)

	config.setWatchJavaScriptDependencies(true)

	config.setUseGitIgnore(false)


	config.addCollection("sortedSnaps", async function () {

		async function gettingCommitedDate(basePath, fileName) {
			const { name } = fileName
			const command = `git log -1 --pretty=\"format:%ct\" \"${basePath}\/${name}\"`

			try {
				const { stdout } = await pExec(command)
				return {
					name,
					time: Number(stdout)
				}
			} catch (e) {
				if (e instanceof Error) {
					console.log(new Error(`Failed executing ${command} with ${e.message}`))
				}
				const metadata = await stat(`${basePath}/${name}`)
				const slug = slugify(name)
				return {
					name: slug,
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

	config.addFilter("hashFromName", async function (str) {
		const te = new TextEncoder()
		const strArrayed = te.encode(str.normalize('NFKC'))
		return murmurhash.v3(strArrayed)

	})



	config.addPlugin(eleventyImageTransformPlugin, {
		// which file extensions to process
		extensions: "html",
		filenameFormat: function (id, src, width, format, options) {
			const extension = path.extname(src)
			const name = path.basename(src, extension)
			return name + '.webp'
		},
		output: "assets/images/",
		formats: ["avif"],
		widths: ["auto"],
		sharpWebpOptions: {
			quality: 95,
			effort: 6
		},
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
		},
		passthroughFileCopy: true,
		templateFormats: ['njk'],
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',
	}
}