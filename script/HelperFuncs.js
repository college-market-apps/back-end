const { createProducts } = require('./modles/products')
const { createImages } = require('./modles/images')
const { createTags } = require('./modles/tags')

async function createProductWithImagesAndTags({ product: productToCreate, images: Ilist, tags: Tlist, existingTags }){
    const [ product ] = await createProducts(productToCreate)
    const images = await createImages(Ilist)

    // find the tags that have been created and seperate them
    const { nonExistingTags } = Tlist.reduce((a,c)=>{
        const { name } = c || {}
        if (!existingTags[name]) a.nonExistingTags.push(c)
        return a
    },{ nonExistingTags:[] })

    const tagsCreated = await createTags(nonExistingTags)

    // add the newly created tags to the created tags
    tagsCreated.forEach((tag,i) => {
        const { name } = tag || {}
        existingTags[name] = tag
    });

    // for image in images asociate to product
    for (let i=0;i< images.length;i++){
        let image = images[i]
        await product.addImages(image)
    }

    // for tag in tags asocate to product
    for (let t=0; t< Tlist.length; t++){
        let { name } = Tlist[t]
        let tag = existingTags[name]
        await tag.addProduct(product)
    }
    return { product, newTagsList: existingTags }
}

async function addProductToUser({user,product}){
    await product.setUser(user)
}

async function createUserProductLikes({ user, products, like}){
    await user.setLike(like)
    await like.addProducts(products)
}

async function createUserPurchases({ user, products, purchase}){
    await user.setPurchase(purchase)
    await purchase.addProducts(products)
}

async function addUserSchool({ user, school, products }){
    await school.addUser(user)
    await school.addProducts(products)
}

exports.createProductWithImagesAndTags = createProductWithImagesAndTags
exports.addProductToUser = addProductToUser
exports.createUserProductLikes = createUserProductLikes
exports.createUserPurchases = createUserPurchases
exports.addUserSchool = addUserSchool
