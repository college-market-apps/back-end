const moment = require("moment");
moment().format();
const { Tag } = require("../../db");

async function createTags(Tlist){
    const tags = await Tag.bulkCreate(Tlist)
    return tags
}

exports.createTags = createTags
