const { Purchase } = require("../../db");

async function createPurchases(){
    const purchases = await Purchase.bulkCreate([
        {
            data: new Date()
        },{
            data: new Date()
        }
    ])
    return purchases
}

exports.createPurchases = createPurchases
