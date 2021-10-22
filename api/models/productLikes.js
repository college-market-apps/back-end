const router = require('express').Router()
const { User, Product, School, Image, Tag } = require("../../db");
module.exports = router
const {requireFBUser} = require('../gateKeeper')
// GET api/products/likes
router.get('/',requireFBUser, async (req,res,next)=>{
  const { user } = req
  const productLikes = await user.getLike({
      include: [
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
    })
  res.send(productLikes)
})

// PUT api/products/likes/add -> add a user like to a product
router.put('/add',requireFBUser, async (req,res,next)=>{
    const {user} = req
    const {productId} = req.body
    try {
      const userLikes = await user.getLike()
      const product = await Product.findOne({
        where:{
          id: productId
        },
        include:[{ model: User }, { model: Image }, { model: Tag }]
      })
      if (!product)throw new Error('Product does not exist')
      await userLikes.addProduct(product)
      res.send({
        product: product.toJSON(),
        message: "Product like added"
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
        message: "there was an error liking this product",
      })
    }
})

// PUT api/products/unlike -> unlike a product
router.put('/remove',requireFBUser, async(req,res,next)=>{
  const {productId} = req.body
    const {user} = req
    try {
      const userLikes = await user.getLike()
      await userLikes.removeProduct(productId)
      res.send({
        sucess: true,
        message: 'Product removed'
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
          message: 'There was an error unliking this project'
        })
    }
})
