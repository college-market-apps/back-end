const router = require('express').Router()
const {  User, Image,Service,Rating,Tag, School } = require("../../db");
const {requireFBUser} = require('../gateKeeper')
module.exports = router

// GET api/services/likes
router.get('/',requireFBUser, async (req,res,next)=>{
  const { user } = req
  const serviceLikes = await user.getLike({
      include: [
        {
        model:Service,
        where:{
          isActive: true
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
          },
          {
            model: Rating,
          }
        ]
      }
    ]
  })
  res.send(serviceLikes)
})


// PUT api/services/like -> add a user like to a service
router.put('/add',requireFBUser, async (req,res,next)=>{
    const {user} = req
    const {serviceId} = req.body
    try {
      const userLikes = await user.getLike()
      const service = await Service.findByPk(serviceId)
      if (!service)throw new Error('service does not exist')
      await userLikes.addService(service)
      res.send({
        service: service.toJSON(),
        message: "service like added"
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
        message: "there was an error liking this service",
      })
    }
})

// PUT api/products/unlike -> unlike a product
router.put('/remove',requireFBUser, async(req,res,next)=>{
  const {serviceId} = req.body
  const { user } = req;
    try {
      let userLikes = await user.getLike({
        include: Service
      })
      if (!userLikes.services.length){ // user does not have likes yet
        res.status(400).send({
          message: 'You have no services to unlike'
        })
        return // so no more headers are set
      }
      const unlikedService = await userLikes.removeService(serviceId)
      res.send({
        sucess: true,
        message: 'Service removed'
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
          message: 'There was an error unliking this service'
        })
    }
})
