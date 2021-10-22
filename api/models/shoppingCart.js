const router = require('express').Router()
const { User, Product, School, Image, Tag, ShoppingCart } = require("../../db");
const { requireFBUser } = require('../gateKeeper');
module.exports = router
const { Op } = require('sequelize')

async function checkIfGroupExist(user, sellerId){
    const shoppingCart = await user.getShoppingCarts({ include:[ { model: User } ] })
    const exist = shoppingCart.find(({users})=>{
        return !!users.find( x => String(x.id) === String(sellerId))
    })
    return !!exist
}

router.get('/',requireFBUser, async (req,res,next)=>{
    const { user } = req
    const shoppingCart = await user.getShoppingCarts({
        include:[
            {
                model: Product,
                include:[
                    {
                        model: User
                    },
                    {
                        model: Image
                    },
                    {
                        model: Tag
                    }
                ]},
                {
                    model: User
                },
        ]
    })
    res.send(shoppingCart)
})

// GET api/shoppingCart/
router.get('/:groupId', requireFBUser, async (req,res,next)=>{
    const { groupId } = req.params
    const shoppingCart = await ShoppingCart.findOne({
        where: {
            id: groupId
        },
        include:[
            {
                model: User
            },
            {
                model: Product
            }
        ]
    })
    res.send(shoppingCart)
})

// POST /api/shoppingcart/
router.post('/creategroup', requireFBUser, async (req,res,next)=>{
    try {
        const { user } = req
        const { groupId, sellerId, productId } = req.body
        const exist = await checkIfGroupExist(user, sellerId)
        if (exist) return res.status(400).send({message: 'Group already exist'})

        const product = await Product.findByPk(productId)
        if (!product) return res.status(400).send({message: 'Product does not exist in database'})
        const newMessage = await ShoppingCart.create({ groupId })
        const messageWithUsers = await newMessage.addUsers([user.id, sellerId])
        await newMessage.addProduct(productId)
        const updatedShopingCart = await user.getShoppingCarts({
            include:[
                {
                    model: Product,
                    include:[
                        {
                            model: User
                        },
                        {
                            model: Image
                        },
                        {
                            model: Tag
                        }
                    ]},
                    {
                        model: User
                    },
            ]
        })
        res.send(updatedShopingCart)
    } catch (error) {
        console.log('error posting message-->', error)
        res.status(400).send()
    }
})

// POST /api/shoppingcart/addproduct
router.post('/addproduct', requireFBUser, async (req,res,next)=>{
    try {
        const { user } = req
        const { groupId, productId } = req.body
        const messageGroup = await ShoppingCart.findOne({
            where:{
                groupId
            }
        })
        const product = await Product.findByPk(productId)
        if (!product || !messageGroup) res.status(400).send()
        await messageGroup.addProduct(product)
        res.status(200).send(product)
    } catch (error) {
        console.log('error posting message-->', error)
        res.status(400).send()
    }
})

router.post('/addgroup', requireFBUser, async (req,res,next)=>{
    const { user } = req
    const { productId, userId, groupId } = req.body
    const newMessageGroup = await ShoppingCart.create({ groupId })
    await newMessageGroup.addUser(userId)
    await newMessageGroup.addProduct(productId)
    const data = await ShoppingCart.findByPk(newMessageGroup.id)
    req.send(data)
})
