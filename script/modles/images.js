const { Image } = require("../../db");

async function createImages(Ilist){
    const images = await Image.bulkCreate(Ilist)
    return images
}

exports.createImages = createImages
