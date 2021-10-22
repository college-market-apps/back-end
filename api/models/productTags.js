const {  User,Product,Tag,Service, Image, School } = require("../../db");
const router = require('express').Router()
module.exports = router
const { requireFBUser } = require('../gateKeeper')

// GET api/products/tags/ -> get products by tag
router.get('/search/:tagName', requireFBUser, async (req,res,next)=>{
  const { tagName }= req.params
  const { user } = req
  const schoolId = user.schools[0].id
  console.log('schoolId-->', schoolId, tagName)
  try {
    const productsByTags = await Tag.findOne({
      where:{
        name: tagName
        },
        include:[
          {
          model: Product,
          where:{
              sold: false
            },
          include: [
            {
              model:Image
            },
            {
              model: User
            },
            {
              model: Tag
            },
          ]
        }
        ]
      })
    res.send(productsByTags || {})
  } catch (error) {
    res.status(400).send({
      message : "There was an error geting products by tag"
    })
  }
})

// POST api/products/tags
router.post('/', requireFBUser, async(req, res,next)=>{
    const user = await User.findByPk(1)
    const {tags,productId} = req.body
    try {
      const product = await Product.findOne({
        where:{
          id: productId,
          userId: user.id
        }
      })
      if (!product)return res.status(400).send({
        message:'There was a problem adding product tags. Product may not exist yet'
      })
      async function createAndAddTag(tag){
        const newTage = await Tag.create({
          name: tag
        })
        await newTage.addProduct(product)
      }

      for (let i=0; i<tags.length; i++){
        const tag = tags[i]
        const tagInst = await Tag.findOne({
          where:{
            name: tag
          }
        })

        if (!tagInst){
          await createAndAddTag(tag)
        }else{
          // somthing here
          await tagInst.addProduct(product)
        }
      }
      res.send({
        message: "Tags added"
      })
    } catch (error) {
      res.status(400).send({
        message:"There was an error adding these tags"
      })
    }
})

// PUT api/products/tags -> delete a product tag
router.put('/delete', async(req,res,next)=>{
  const {tag, productId: id} = req.body
  const user = await User.findByPk(1)
    try {
      const userProduct = await user.getProducts({
        where:{
          id
        }
      })
      if (!userProduct[0]){
        return {
          message: "The product does not have this tag"
        }
      }
      const tagInst = await Tag.findOne({
        where:{
          name: tag
        }
      })

      if (!tagInst)return res.status(400).message({
        message: 'Tag not used by product'
      })
      await tagInst.removeProduct(userProduct[0])
      res.send({
        message: "product tag deleted!"
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
        message: "There was an error deleting tag"
      })
    }
})


