try {
	const basePath = 'src/assets/images/'
	const dir = await Promise.all(await readdir(basePath, { withFileTypes: true }))

	await Promise.all(dir.map(async (fileName) => {
		const { name } = fileName
		const metadata = await stat(`${basePath}/${name}`)

		return {
			name,
			time: metadata.mtime.getTime()
		}
	}
	)).filter((file) => {

		const isImage = new RegExp(/\.(png|jpg|jpeg|gif|webp)$/g)
		if (isImage.test(file.name)) {
			return true
		}
	}).sort((a, b) => a.time - b.time).map(file => file.name).reverse()


} catch (err) {
	console.error(err)
}