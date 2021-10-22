const graphql = require("graphql");
const { User, Product, School, Image, Like, Service } = require("../../db");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;
const {SingleProductFieldType} = require('./product')
const {SingleServiceFieldTypes} = require('./service')
const productObj = {
  id: { type: GraphQLID },
  userId: { type: GraphQLID },
  name: { type: GraphQLString },
  price: { type: GraphQLInt },
  title: { type: GraphQLString },
  description: { type: GraphQLString },
  placesCanMeet: { type: GraphQLString },
  sold: { type: GraphQLBoolean },
  condition: { type: GraphQLString },
  createdAt: { type: GraphQLString },
}

const SingleLikeFieldType = new GraphQLObjectType({
  name: 'SingleLikeFieldType',
  fields: ()=>({
    product:{type: SingleProductFieldType},
    service:{type: SingleServiceFieldTypes},
    data: {type: GraphQLString},
    message: {type: GraphQLString},
  })
})

const likeProduct = {
  type: SingleLikeFieldType,
  args:{
    productId: {type: GraphQLID},
  },
  async resolve(_,{productId},context){
    // const user = await User.findByToken(context.authenticate);
    console.log('here!!')
    const user = await User.findByPk(1);
    try {
      // const user = await User.findByToken(context.authenticate);
      const user = await User.findByPk(1);
      const userLikes = await user.getLike({
        include: Product
      })
      const likeExist = userLikes.products.some(x=> x.id===Number(productId))
      if (likeExist) return {
        message:"This product is already liked"
      }
      const product = await Product.findByPk(productId)
      await userLikes.addProduct(product)

      return {
        product: product.toJSON(),
        message: "Product like added"
      }
    } catch (error) {
      console.log(error)
      return {
        message: "there was an error liking this product",
      }
    }
  }
}

const removeProductLike = {
  type: SingleLikeFieldType,
  args:{
    productId: {type: GraphQLID},
  },
  async resolve(_,{productId},context){
    // const user = await User.findByToken(context.authenticate);
    const user = await User.findByPk(1);
    try {
      const user = await User.findByPk(1);
      const userLikes = await user.getLike()
      await userLikes.removeProduct(productId)
      return {
        message: "Product like removed"
      }
    } catch (error) {
      console.log(error)
      return {
        message: "there was an error removinging this product like",
      }
    }
  }
}

const likeService = {
  type: SingleLikeFieldType,
  args:{
    serviceId: {type: GraphQLID},
  },
  async resolve(_,{serviceId},context){
    // const user = await User.findByToken(context.authenticate);
    const user = await User.findByPk(1);
    try {
      const user = await User.findByPk(1);
      const userLikes = await user.getLike({
        include: Service
      })

      const likeExist = userLikes.services.some(x=> x.id===Number(serviceId))
      if (likeExist) return {
        message:"This service already liked"
      }
      const service = await Service.findByPk(serviceId)
      await userLikes.addService(serviceId)
      return {
        service:  service,
        message: "Service like added"
      }
    } catch (error) {
      console.log(error)
      return {
        message: "there was an error liking this product",
      }
    }
  }
}

const removeServiceLike = {
  type: SingleLikeFieldType,
  args:{
    serviceId: {type: GraphQLID},
  },
  async resolve(_,{serviceId},context){
    // const user = await User.findByToken(context.authenticate);
    const user = await User.findByPk(1);
    try {
      // const user = await User.findByToken(context.authenticate);
      const user = await User.findByPk(1);
      const userLikes = await user.getLike()
      console.log(userLikes.__proto__)
      await userLikes.removeService(serviceId)
      return {
        message: "Service like removed"
      }
    } catch (error) {
      console.log(error)
      return {
        message: "there was an error removinging this service like",
      }
    }
  }
}

module.exports = {
  like_queries:{

  },
  like_mutations:{
    likeProduct,
    removeProductLike,
    likeService,
    removeServiceLike
  }
}
