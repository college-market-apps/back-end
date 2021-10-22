const router = require('express').Router()
const {  User, Image,Service,Rating,Tag, School } = require("../../db");
const { requireFBUser } = require('../gateKeeper');
module.exports = router

function eagerLoad(){
  return (
    [
      {
        model:User
      },
      {
        model: Rating
      },
      {
        model: Image
      },
      {
        model: Tag
      }
    ]
  )
}

router.get('/byschool',requireFBUser, async (req,res,next)=>{
  const {user} = req
    try {
      const userSchools = await user.getSchools()
      const userSchoool = userSchools[0].id
      const schoolServices = await School.findOne({
        where:{
          id: userSchoool
        },
        include: {
          model: Service,
          where:{
            isActive: true
          },
          include: eagerLoad()
        }
      });
      res.send(schoolServices || {})
    } catch (error) {
      res.status(400).send({
        message:'there was an error geting shool services'
      })
    }
})

// GET /api/services/ -> get a single service
router.get('/:serviceId',requireFBUser, async(req,res,next)=>{
  const serviceId = req.params.serviceId
  try {
    const service = await Service.findOne({
      where: {
        id: serviceId,
        isActive: true
      },
      include: eagerLoad()
    })
    if (!service) return res.send({
      message:"service does not exist",
      sucess: false
    })
    res.send(service)
  } catch (error) {
    res.status(400).send({
      message: 'there was an error fetching this service'
    })
  }
})

// POST /api/services/ -> create a service
router.post('/', requireFBUser, async (req, res,next)=>{
  try {
    const args = req.body
    const user = await User.findByPk(1);
    const schoolId = args.schoolId
    delete args.schoolId
    const newService = await Service.create({...args, isActive: true, userId: user.id})
    await newService.addSchool(schoolId)
    res.send(newService)
  } catch (error) {
    console.log(error)
    res.status(400).send({message:'there was an error creating this service'})
  }
})

// PUT /api/services/sell -> archive a user service
router.put('/archive', requireFBUser, async(req,res,next)=>{
  const user = await User.findByPk(1)
  try {
    const {serviceId: id} = req.body
    const archivedService = await Service.update({isActive: false},{
      where:{
        id,
        userId: user.id
      }
    })
    if (!archivedService[0]) throw new Error('User is not selling this service or it does not exist')
    res.send({message:"Service has been archived"})
  } catch (error) {
    console.log(error)
    res.status(400).send({message:"there was an erro archiving this service"})
  }
})

// PUT api/services/update -> update any feild on a user serivce
router.put('/update', requireFBUser, async(req,res,next)=>{
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
      const updateService = await Service.update(updatingObj,{
        where:{
          id: args.serviceId,
          userId: user.id
        }
      })
      if(updateService[0] === 0) throw new Error("There wasn an error updating service. It is not the user's service  does not exist")
      res.send({
        message: 'Service updated!'
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
        message: 'There was an error updating your service'
      })
    }
})

