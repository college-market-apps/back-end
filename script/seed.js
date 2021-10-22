
const { createProductWithImagesAndTags, addProductToUser, createUserProductLikes, createUserPurchases, addUserSchool } = require('./HelperFuncs')
const { usersWithProducts, user: userData, school } = require('./seedData')
const { db, Product } = require("../db");
const { associateProductsToUser } = require('./modles/products')
const { createSchools } = require('./modles/schools')
const { createUsers } = require('./modles/users')
const { createLike } = require('./modles/likes')
const { createNewShoppingCart, addUsersToShoppingCart } = require('./modles/messages')
require("dotenv").config();

/*
    create products -> imags -> tags ^
    create users -> products ^
    create likes -> set user -> add products ^
    create purchase -> set user -> product (at random) ^
    create schools -> users ^
    create message -> make message -> add users
*/

async function createUserAndProducts({ products, school, existingTags, newProducts, createdUser}){
    for (let i=0; i< newProducts.length; i++){
        let { product, images, tags } = newProducts[i]
        // create the product and add images and tags to it
        const { product: newProduct} = await createProductWithImagesAndTags({product, images, tags, existingTags })
        await school.addProduct(newProduct)
        const userProd = await newProduct.setUser(createdUser) // updates the user id
        products.push(userProd)
    }
}

async function likeRandomProducts(user, products){
    const visitedIndex = []
    const nonUserProds = products.filter(x=>x.userId !== user.id)
    const randNum = Math.floor(Math.random() * nonUserProds.length) || 1
    if (!nonUserProds) return
    const like = await createLike()
    for (let i=0; i< randNum; i++){
        const randIndex = Math.floor(Math.random() * nonUserProds.length )
        if (visitedIndex.includes(randIndex)) continue
        const product = nonUserProds[randIndex]
        await user.setLike(like)
        await like.addProduct(product)
        visitedIndex.push(randIndex)
    }
}


async function seed() {
    await db.sync({ force: true }); // clears db and matches models to tables
    // create products with images and tags
    let products = []
    let users = []
    let existingTags = {}
    const [newSchool] = await createSchools([school])
    let count = 0
    for (let i=0; i< usersWithProducts.length; i++){
        const { products: newProducts, user: newUser } = usersWithProducts[i]
        const [ createdUser ] = await createUsers([ newUser ])
        users.push(createdUser)
        await createdUser.addSchool(newSchool)
        await createUserAndProducts({ products, users, existingTags, newProducts, createdUser, school: newSchool })
        await likeRandomProducts(createdUser, products)
    }
    // const newShoppingCart = await createNewShoppingCart(process.env.GROUPID_1)
    // const assignedUsers = await addUsersToShoppingCart({newShoppingCart, users: [users[0], users[1]]})

    // // get products for each user then add it to addProducts by useing [users[0], users[1]
    // const users1Products = await users[0].getProducts()
    // const users2Products = await users[1].getProducts()
    // await newShoppingCart.addProducts(users1Products)
    // await newShoppingCart.addProducts(users2Products)
}

async function runSeed() {
    console.log("seeding...");
    try {
        await seed();
        // await db.sync({ force: true });
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    } finally {
        console.log("closing db connection");
        await db.close();
        console.log("db connection closed");
    }
}

if (module === require.main) {
    runSeed();
}

module.exports = seed;
