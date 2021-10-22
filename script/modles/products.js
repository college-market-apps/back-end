const { Product } = require("../../db");

async function createProducts(Plist){
    const products = await Product.bulkCreate(Plist)
    return products
}

async function associateProductsToUser(user, products){
    for (let i=0; i< products.length; i++){
        await user.addProduct(products[i])
    }
}

exports.createProducts = createProducts
exports.associateProductsToUser = associateProductsToUser
