const { ShoppingCart } = require("../../db");

async function createNewShoppingCart(groupId){
    const newShoppingCart = await ShoppingCart.create({ groupId })
    return newShoppingCart
}

async function addUsersToShoppingCart({ newShoppingCart, users}){
    const uList = []
    for (let i=0;i < users.length; i++){
        const u = await newShoppingCart.addUser(users[i])
        uList.push(u)
    }
    return uList
}

async function addProductsToMessage({shoppingCart, products}){
    await shoppingCart.addProducts(products)
}


exports.createNewShoppingCart = createNewShoppingCart
exports.addUsersToShoppingCart = addUsersToShoppingCart
