

const { readdir, stat } = require('fs/promises');

module.exports = async function () {
	try {
		const basePath = 'src/assets/images/'
		const dir = await readdir(basePath, { withFileTypes: true });

		let files = dir.map(file => file.name
		).filter((fileName) => {
			const isImage = new RegExp(/\.(png|jpg|jpeg|gif|webp)$/g)
			if (isImage.test(fileName)) {
				return true
			}
		}).sort(async (a, b) => {
			let aStat = await stat(`${basePath}/${a}`),
				bStat = await stat(`${basePath}/${b}`);
			//console.log(aStat);
			return new Date(aStat.mtime).getTime() - new Date(bStat.mtime).getTime();
		});
		return { images: files.reverse() }

	} catch (err) {
		console.error(err);
	}
}
