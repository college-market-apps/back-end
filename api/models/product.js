const router = require('express').Router()
const { User, Product, School, Image, Tag, Purchase } = require("../../db");
const { requireFBUser } = require('../gateKeeper');
module.exports = router
const {uploadFile} = require('../s3')
const multer = require('multer');
var upload = multer({ dest: 'uploads/' }); //setting the default folder for multer
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { getFileStream, deleteImage , presignedGETURL} = require("../../schema/s3");

function productDetail(){
    return [
        {
            model:Product,
            where:{
                sold: false
            },
            include:[
                {
                    model: User,
                },
                {
                    model: Image,
                },
                {
                    model: Tag,
                }
            ]
        }
    ]
}


router.get('/byschool',requireFBUser, async (req,res,next)=>{
    const {user} = req
    const userSchools = await user.getSchools()
    const schoolProducts = await School.findOne({
        where:{
            id: userSchools[0].id,
        },
        include: productDetail()
    });
    res.send(schoolProducts || [])
})

// GET /api/products/ -> get a single product
router.get('/', async(req,res,next)=>{
    const productId = req.body.productId
    const product = await Product.findOne({
            where: {
                id:productId,
            },
            include: [
                {
                    model:User
                },
                {
                    model: Image
                },
                {
                    model: Tag
                }
            ]
        })
    res.send(product)
})

// POST /api/products/ -> create a product
router.post('/', requireFBUser, async (req, res,next)=>{
    try {
        const { product, tags, imagePaths } = req.body
        const { user } = req
        const schoolId = user.schools[0].id

        // create product
        const newProduct = await Product.create({...product, sold: false, userId: user.id})
        await newProduct.addSchool(schoolId)
        const productId = newProduct.id

        // uplaod images and assosate to new product
        for (let i in imagePaths){
            const path = imagePaths[i]
            const newImage = await Image.create({ path, productId, isAWS: true })
            await newProduct.addImage(newImage)
        }

        // create/update tags
        for (let i in tags){
            const tagName = tags[i]
            const existingTag = await Tag.findOne({ where: { name: tagName } })
            if (existingTag) newProduct.addTag(existingTag)
            else{
                const newTag = await Tag.create({ name: tagName })
                await newProduct.addTag(newTag)
            }
        }
        const updatedProduct = await Product.findOne({
            where: { id: productId },
            include:[ { model: User,}, { model: Image, }, { model: Tag, } ]
        })
        res.send(updatedProduct)
    } catch (error) {
        console.log('error posting product-->', error)
        res.status(400).send({message:'there was an error creating this product'})
    }
})

// PUT /api/products/sell -> sell a user product
router.put('/sell', requireFBUser, async(req,res,next)=>{
    const { user } = req
    try {
        const {productId: id, purchaserUserId } = req.body
        const product = await Product.findOne({ where:{ id, userId: user.id } })
        if (!product) throw new Error('User is not selling this product or it does not exist')
        // find purchaser
        let purchase = await Purchase.findOne({ where: { userId: purchaserUserId } })
        // if they dont exist create a purchase for them
        if (!purchase) purchase = await Purchase.create({ userId: purchaserUserId })
        // add the pruduct to the purchase
        await purchase.addProduct(id)
        const updatedProduct = await product.update({sold: true, purchaseId: purchase.id})
        res.status(200).send({message:"Product Sold!", product: updatedProduct})
    } catch (error) {
        console.log(error)
        res.status(400).send({message:"there was an erro selling product"})
    }
})

// PUT api/products/update -> update any feild on a user product
router.put('/update', async(req,res,next)=>{
    let args = req.body
    const user = await User.findByPk(1)
    const updatingObj = Object.keys(args).reduce((accum, key)=>{
            if (!args[key]){
                return accum
            }
            accum[key] = args[key]
            return accum
        },{})

        try {
            const updatedProduct = await Product.update(updatingObj,{
                where:{
                    id: args.productId,
                    userId: user.id
                }
            })
            if(updatedProduct[0] === 0) throw new Error('There wasn an error updating product. Product is not users or product does not exist')
            res.send({
                message: 'Product Updated!'
            })
        } catch (error) {
            console.log(error)
            res.status(400).send({
                message: 'There was an error updating your product'
            })
        }
})

router.get('/:productId',requireFBUser, async (req,res,next)=>{
    const { user } = req
    const { productId } = req.params
    console.log('productId--->', productId)
    try {
        const product = await Product.findOne({
            where:{
                id:productId
            },
            include:[
                    {
                        model: User,
                    },
                    {
                        model: Image,
                    },
                    {
                        model: Tag,
                    }
                ]
        })
        res.send(product || [])
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
})

// DELETE api/products -> delete a user product being sold
router.delete('/:id', async (req,res,next)=>{
    const id = req.params.id
    try{
        const user = await User.findByPk(1)
            const product = await Product.findOne({
                where:{
                    id,
                    userId: user.id
                }
            })
            if (!product){
                throw new Error('Not a valid product to delete')
                res.status(400).send({
                    message:"Not a valid product to delete"
                })
                return
            }
            await product.destroy()
            res.send({ message: "Product deleted"})
        } catch (error) {
            console.log('errorr--->', error)
            res.status(400).send({ message:"There was an error deleting this product"})
        }
})
