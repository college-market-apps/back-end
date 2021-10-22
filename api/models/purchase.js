const {  User, Purchase,Product } = require("../../db");
const router = require('express').Router()
module.exports = router
const {requireFBUser} = require('../gateKeeper')

router.get('/', requireFBUser, async (req,res,next)=>{
    const user = await User.findByPk(1,{
        include:{
            model: Purchase,
            include: Product
        }
    })
    res.send(await user.getPurchase({include:{
        model: Product,
        include: User
    }}))

})
