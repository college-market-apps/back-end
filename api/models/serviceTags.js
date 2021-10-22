const {  User,Product,Tag,Service, Image,Rating } = require("../../db");
const router = require('express').Router()
module.exports = router

// GET api/services/tags/ -> get services by tag
router.get('/', async (req,res,next)=>{
  const {tag: name}= req.body
  try {
    const servicesByTags = await Tag.findOne({
      where:{
        name
        },
        include:[
          {
          model: Service,
          where:{
              isActive: true
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
            {
              model: Rating
            }
          ]
        }
        ]
      })
    res.send(servicesByTags || {})
  } catch (error) {
    res.status(400).send({
      message : "There was an error geting services by tag"
    })
  }
})

// POST api/services/tags -> add tags to a service
router.post('/', async(req, res,next)=>{
    const user = await User.findByPk(1)
    const {tags,serviceId} = req.body
    try {
      const service = await Service.findOne({
        where:{
          id: serviceId,
          userId: user.id
        }
      })
      if (!service)return res.status(400).send({
        message:'There was a problem adding service tags. Service may not exist yet'
      })
      async function createAndAddTag(tag){
        const newTage = await Tag.create({
          name: tag
        })
        await newTage.addService(service)
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
          await tagInst.addService(service)
        }
      }
      res.send({
        message: "Tags added"
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
        message:"There was an error adding these tags"
      })
    }
})

// PUT api/services/tags -> delete a service tag
router.put('/delete', async(req,res,next)=>{
  const {tag, serviceId: id} = req.body
  const user = await User.findByPk(1)
    try {
      const useService = await user.getServices({
        where:{
          id
        }
      })
      if (!useService[0]){
        return {
          message: "The service does not have this tag"
        }
      }
      const tagInst = await Tag.findOne({
        where:{
          name: tag
        }
      })

      if (!tagInst)return res.status(400).message({
        message: 'Tag not used by service'
      })
      await tagInst.removeService(useService[0])
      res.send({
        message: "Service tag deleted!"
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
        message: "There was an error deleting tag"
      })
    }
})
