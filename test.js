const { readdir, stat } = require('node:fs/promises')
const path = require('node:path')
const { stdout } = require('node:process')
const util = require('node:util')
const exec = util.promisify(require('node:child_process').exec)


async function test() {
	try {
		const basePath = 'src/assets/images/'
		const dir = await readdir(basePath, { withFileTypes: true })
		return (await Promise.all(dir.map(async (fileName) => {
			const { name } = fileName
			const command = `git log -1 --pretty=\"format:%ct\" \"${basePath}\/${name}\"`
			try {
				return {
					name,
					time: Number(await exec(command))
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
		))).filter((file) => {

			const isImage = new RegExp(/\.(png|jpg|jpeg|gif|webp)$/g)
			if (isImage.test(file.name)) {
				return true
			}
		})
			.sort((a, b) => a.time - b.time).map(file => file.name).reverse()


	} catch (err) {
		console.error(err)
	}
}


module.exports = test

console.log(test())