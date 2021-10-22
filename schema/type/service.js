const graphql = require("graphql");
const {  User, Image,Service,Rating,Tag,School } = require("../../db");
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList } = graphql;

const {UserFieldType} = require('./user')
const {RatingFieldType} = require('./rating')
const {ImageFieldType} = require('./image')
// const {TagFieldType} = require('./tags')
const TagFieldType = new GraphQLObjectType({
  name:'ServiceTagFieldType',
  fields:()=>({
  id: {type: GraphQLID},
  name: {type: GraphQLString},
  createdAt: {type: GraphQLString},
  message: {type: GraphQLString},
  })
})

function eagerLoad(){
  return (
    [
      {
        model:User
      },
      {
        model: Rating,
        include: User
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

const serviceFieldTypeObj = {
  id: {type: GraphQLID},
  title: {type: GraphQLString},
  description:{type: GraphQLString},
  price: {type: GraphQLInt},
  createdAt:{type: GraphQLString},
  message:{type: GraphQLString},
}

const SingleServiceFieldTypes = new GraphQLObjectType({
  name:"ServiceFieldTypes",
  fields:()=>({
  id: {type: GraphQLID},
  title: {type: GraphQLString},
  description:{type: GraphQLString},
  price: {type: GraphQLInt},
  createdAt:{type: GraphQLString},
  message:{type: GraphQLString},
  user: {type: UserFieldType},
  ratings: {type: GraphQLList(RatingFieldType)},
  images: {type: GraphQLList(ImageFieldType)},
  tags: {type: GraphQLList(TagFieldType)}
})
})

const DetailedServiceFieldTypes = new GraphQLObjectType({
  name: 'DetailedServiceFieldTypes',
  fields:()=>({
    ...serviceFieldTypeObj,
    user: {type: UserFieldType},
    ratings: {type: GraphQLList(RatingFieldType)},
    images: {type: GraphQLList(ImageFieldType)},
    tags: {type: GraphQLList(TagFieldType)}
  })
})

const MultiServiceFieldType = new GraphQLObjectType({
  name: 'MultiServiceFieldType',
  fields:()=>({
    services: {type: GraphQLList(SingleServiceFieldTypes)}
  })
})

const ListServicesFieldTypes = new GraphQLObjectType({
  name:'ListServicesFieldTypes',
  fields:()=>({
    services:{type: GraphQLList(DetailedServiceFieldTypes)}
  })
})

const getServicesBySchool = {
  type: MultiServiceFieldType,
  // args: {
  //   schoolId: {type: GraphQLID}
  // },
  async resolve(_, {schoolId}, context) {
    // const user = await User.findByToken(context.authenticate);
    const user = await User.findByPk(1);
    try {
      const userSchools = await user.getSchools()
      const schoolId = userSchools[0].id
      if (!schoolId) throw new Error("User has no school assigned")
      const schoolServices = await School.findOne({
        where:{
          id: schoolId // by school id or userschool
        },
        include: {
          model: Service,
          where:{
            isActive: true
          },
          include: eagerLoad()
        }
      });
      return schoolServices
    } catch (error) {
      console.log(error)
    }
  },
};

const getService = {
  type: SingleServiceFieldTypes,
  args:{
    serviceId: {type: GraphQLID}
  },
  async resolve(_,{serviceId},context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    try {
      const service = await Service.findOne({
        where:{
          id: serviceId,
          isActive: true
        },
        include: eagerLoad()
      })
      return service
    } catch (error) {
      return {
        message: "there was an error geting the services"
      }
    }
  }
}

const getUserServices = {
  type: MultiServiceFieldType,
  args:{
    userId: {type: GraphQLID}
  },
  async resolve(_,args,context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    try {
      const services = await Service.findAll({
        where:{
          userId: args.userId,
          isActive: true
        },
        include: eagerLoad()
      })
      return {
        services
      }
    } catch (error) {
      return {
        message: "there was an error geting active services"
      }
    }
  }
}

const getArcivedUserServices = {
  type: MultiServiceFieldType,
  args:{
    userId: {type: GraphQLID}
  },
  async resolve(_,args,context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    try {
      const services = await Service.findAll({
        where:{
          userId: args.userId,
          isActive: false
        },
        include: eagerLoad()
      })
      return {
        services
      }
    } catch (error) {
      return {
        message:"There was an error geting your archived services"
      }
    }
  }
}

const getUserServiceLikes = {
  type: MultiServiceFieldType,
  async resolve(_, __, context) {
    // const user = await User.findByToken(context.authenticate);
    const user = await User.findByPk(1);
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
          }
        ]
      }
    ]
    })
    return {
      services : serviceLikes?.services
    }
  },
};

// MUTATIONS
const createService = {
  type: SingleServiceFieldTypes,
  args:{
    description:{type: GraphQLString},
    title:{type: GraphQLString},
    price:{type: GraphQLInt},
    placesCanMeet:{type: GraphQLString},
  },
  async resolve(_,args,context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    try {
      const userId = user.id
      const userSchools = await user.getSchools()
      const newService = await Service.create({...args, userId})
      await newService.addSchool(userSchools[0])
      return newService
    } catch (error) {
      return {
        message: "There was an error adding this service"
      }
    }
  }
}

// Don't want to delete because others may be dependent on it
const arciveService = {
  type: SingleServiceFieldTypes,
  args:{
    id:{type: GraphQLID},
  },
  async resolve(_,args,context){
    // const user = await User.findByToken(context.authenticate)
    const {id} = args
    const user = await User.findByPk(1)
    const archivedService = await Service.update({
      isActive: false
    },{
      where: {
        id
      }
    })
    return archivedService
  }
}


module.exports = {
  service_queries:{
    getService,
    getUserServices,
    getArcivedUserServices,
    getUserServiceLikes,
    getServicesBySchool
  },
  service_mutations:{
    createService,
    arciveService
  },
  SingleServiceFieldTypes
}
