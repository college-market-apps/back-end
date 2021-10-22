const moment = require("moment");
moment().format();
const { User } = require("../../db");

async function createUsers(Ulist){
    const listUsers = await User.bulkCreate(Ulist)
    return listUsers
}

exports.createUsers = createUsers
