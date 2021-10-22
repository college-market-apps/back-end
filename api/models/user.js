const router = require('express').Router()
const {
    db,
    User,
    Image,
    Product,
    ProductLike,
    ProductPurchase,
    Rating,
    Service,
    ServiceLike,
    ServicePurchase,
    Tag,
    School,
    Purchase
} = require('../../db')
const {requireFBUser} = require('../gateKeeper')

module.exports = router
function eagerLoadService(){
    return [
                {
                    model: Image,
                },
                {
                    model: Tag,
                },
                {
                    model: Rating
                }
            ]
}
function eagerLoadProduct(){
    return [
                {
                    model: Image,
                },
                {
                    model: User,
                },
                {
                    model: Tag,
                }
            ]
}

// api/users/
router.get('/', requireFBUser, async (req,res,next)=>{
    try {
            const {user} = req
            res.send(user)
        } catch (error) {
            console.log('error -->', error)
            res.status(400).send()
    }
})

router.get('/products', requireFBUser, async(req,res,next)=>{
    const { user } = req
    try {
        const userProducts = await user.getProducts({
            include:[
                {
                    model: Purchase,
                    include: User
                },{
                    model: Image
                },{
                    model: Tag
                },
            ]
        })
        const purchasedProducts = await user.getPurchase({
            include:{
                model: Product,
                include:[
                {
                    model: User
                },{
                    model: Image
                },{
                    model: Tag
                },
            ]
            }
        })
        res.send({userProducts,purchasedProducts: purchasedProducts?.products || []})
        return
    } catch (error) {
        console.log('error with fetching user products-->', error)
        res.status(400).send()
    }
})

router.get('/search/:userId', requireFBUser, async (req,res,next)=>{
    try {
            const {user} = req
            const {userId} = req.params
            const searchUser = await User.findOne({
                where:{
                    id: userId
                },
                include:[
                    {
                        model: School,
                    },
                    {
                        model: Product,
                        include:[
                            {
                                model: Image
                            },
                            {
                                model: Tag
                            },
                        ]
                    }
                ]
            })
            res.send(searchUser)
        } catch (error) {
            console.log('error -->', error)
            res.status(400).send()
    }
})
