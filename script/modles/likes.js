const { Like } = require("../../db");

async function createLikes(){
    const likes = await Like.bulkCreate([
        {
            date:new Date()
        },
        {
            date: new Date()
        }
    ])
    return likes
}

async function createLike(){
    return await Like.create({ date: new Date() })
}

exports.createLikes = createLikes
exports.createLike = createLike
