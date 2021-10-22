const {  User, Rating } = require("../../db");
const router = require('express').Router()
module.exports = router
const {requireFBUser} = require('../gateKeeper')
// DELETE api/services/remove/:serviceId -> remove serivce rating
router.delete('/remove/:serviceId',requireFBUser, async(req,res,next)=>{
    const user = await User.findByPk(1)
    const {serviceId} = req.params
    try {
      const rating = await Rating.findOne({
      where:{
        userId: user.id,
        serviceId
      }
      })

      if (!rating) return res.status(400).send({
          message: "This service rating does not exist"
        })

      await rating.destroy()
      res.send({
        ...rating.toJSON(),
        message:"Rating removed"
      })
    } catch (error) {
      res.status(400).send({
        message: "There was an error removing service rating."
      })
    }
})

// POST api/service/ratings/add -> add a rating for a service
router.post('/add',requireFBUser, async(req,res,next)=>{
    try {
      const args = req.body
      const {user} = req
      args.userId = user.id
      const existingRating = await Rating.findAll({
        where:{
          serviceId: args.serviceId,
          userId: user.id
        }
      })
      if (existingRating.length) return res.send({
          message: "You have an existing rating for this service"
        })
      console.log()
      const ratingData = await Rating.create(args)
      res.send({
        ...ratingData.toJSON(),
        message:"Rating added!"
      })
    } catch (error) {
      res.status(400).send({
        message:'There was an error adding this rating'
      })
    }
})
