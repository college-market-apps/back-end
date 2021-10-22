const { School } = require('../../db')

async function createSchools(Slist){
    const schools = await School.bulkCreate(Slist)
    return schools
}

exports.createSchools = createSchools
