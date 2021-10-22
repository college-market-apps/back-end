const router = require('express').Router()
const { User, School, Like } = require("../../db");
module.exports = router
const { requireFBToken, requireFBUser } = require('../gateKeeper')

router.put('/signin', requireFBUser, async (req,res,next)=>{
    const { user } = req
    try {
        res.status(200).send(user)
    } catch (error) {
        res.send(400).send()
    }
})

router.post('/signup',requireFBToken, async (req,res,next)=>{
    const { uid } = req
    try {
    const { profileImage, email, name, schoolId } = req.body
    const newUser = await User.create({ uid, profileImage, email, name })
    // add a school to user
    const school = await School.findByPk(schoolId)
    await school.addUser(newUser)
    // create product likes list
    const newLikes = await Like.create()
    await newUser.setLike(newLikes)
    res.send(newUser)
    } catch (error) {
        console.log('error adding new user-->', error)
        res.status(403).send(error)
    }
})
