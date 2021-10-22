const {createUsers} = require('./modles/users')
const {createServices} = require('./modles/services')
const {createPurchases} = require('./modles/purchase')
const { createProducts } = require('./modles/poducts')
const { createLikes } = require('./modles/likes')
const { createSchools } = require('./modles/schools')
const { createTags } = require('./modles/tags')
const { createImages } = require('./modles/images')
const moment = require("moment");
moment().format();
const { db } = require("../db");
require("dotenv").config();

function randDate(max, min) {
    const date = new Date();
    let randNum = Math.floor(Math.random() * (max - min) + min);
    startdate = moment(date);
    return startdate.subtract(randNum, "d").toString();
}

async function seed() {
    await db.sync({ force: true }); // clears db and matches models to tables
    const [user1,user2] = await createUsers()
    const [service1, service2] = await createServices()
    const [purchase1, purchase2] = await createPurchases()
    const [product1, product2] = await createProducts()
    const [like1, like2] = await createLikes()
    const [school1, school2] = await createSchools()
    const [tag1, tag2] = await createTags()
    const [image1, image2] = await createImages()

    // purchases
    // console.log(user1.__proto__)
    await user1.setPurchase(purchase1)
    await user2.setPurchase(purchase2)

    // purchase product
    await purchase1.addProduct(product1)

    // user schools
    await school1.addUser(user1)
    await school2.addUser(user2)

    // product schools
    await school1.addProduct(product1)
    await school1.addProduct(product2)

    // products
    await product1.setUser(user1)
    await product2.setUser(user1)

    //product images
    await product1.addImages([image1])
    await product2.addImages([image2])

    // product likes
    await user1.setLike(like1)
    await like1.addProducts([product1, product2])
    await user2.setLike(like2)
    await like2.addProducts(product2)

    // // product tags
    await tag1.addProduct(product1)
    await tag2.addProduct(product2)

    // // service schools
    // product schools
    await school1.addService(service1)
    await school1.addService(service2)

    // services
    await service1.setUser(user1)
    await service2.setUser(user1)

    // // service tags
    await tag1.addService(service1)
    await tag2.addService(service2)

    //services images
    await service1.addImages([image1, image2])
    await service1.addImages([image1])

    // product likes
    await like1.addServices(service1)
    await like2.addServices([service1, service2])

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
