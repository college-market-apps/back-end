const graphql = require("graphql");
const {  User, Rating } = require("../../db");
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList } = graphql;
const {UserFieldType} = require('./user')


const RatingFieldType = new GraphQLObjectType({
  name: 'Rating',
  fields:()=>({
    id: {type: GraphQLID},
    title: {type: GraphQLString},
    description: {type: GraphQLString},
    message: {type: GraphQLString},
    createdAt:{type: GraphQLString},
    userId: {type: GraphQLID},
    user: {type: UserFieldType},
})
})

const ListRatingType = new GraphQLObjectType({
  name: "DetailedRating",
  fields: ()=>({
    ratings: {type: GraphQLList(RatingFieldType)}
  })
})

// QUERY
const getServiceRatings = {
  type: ListRatingType,
  args:{
    serviceId: {type: GraphQLID}
  },
  async resolve(_, {serviceId}, context){
    // const user = User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    try {
      const ratingData = await Rating.findAll({
        where: {
          serviceId,
        },
        include: User
      })
      return {
        ratings: ratingData,
        message: "Rating added"
      }
    } catch (error) {
      return {
        message:"There was an error geting the service ratings"
      }
    }
  }
}


const addServiceRating = {
  type: RatingFieldType,
  args:{
    description: {type: GraphQLString},
    serviceId: {type: GraphQLID}
  },
  async resolve(_,args, context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    args.userId = user.id
    const existingRating = await Rating.findAll({
      where:{
        id: args.serviceId,
        userId: user.id
      }
    })
    if (existingRating.length){
      console.log(existingRating)
      return {
        message: "You have an existing rating for this service"
      }
    }
    const ratingData = await Rating.create(args)
    return {
      ...ratingData.toJSON(),
      message:"Rating added!"
    }
  }
}

const removeServiceRating = {
  type: RatingFieldType,
  args:{
    serviceId: {type: GraphQLID}
  },
  async resolve(_,{serviceId}, context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    try {
      const rating = await Rating.findOne({
      where:{
        userId: user.id,
        serviceId
      }
    })
    if (!rating){
      return {
        message: "This service rating does not exist"
      }
    }
    await rating.destroy()
    return {
      ...rating.toJSON(),
      message:"Rating removed"
    }
    } catch (error) {
      return {
        message: "There was an error removing service rating."
      }
    }
  }
}

module.exports = {
  rating_queries:{
    getServiceRatings
  },
  rating_mutations:{
    addServiceRating,
    removeServiceRating
  },
  RatingFieldType
}
