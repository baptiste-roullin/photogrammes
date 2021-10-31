

const { readdir } = require('fs/promises');

module.exports = async function () {
	try {
		const files = await readdir('src/assets/images/', { withFileTypes: true });
		const images = files.map(file => file.name).filter(fileName => {

			const isImage = new RegExp(/\.(png|jpg|jpeg|gif|webp)$/g)
			if (isImage.test(fileName)) {
				return true
			}
		})

		return { images: images }

	} catch (err) {
		console.error(err);
	}
}
