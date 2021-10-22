const graphql = require("graphql");
const {  User,Product,Tag,Service, Image, } = require("../../db");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;
// const {UserFieldType} = require('./user')
// const {ImageFieldType} = require('./image')
const {DetailedServiceFieldTypes} = require('./service')
// const {...items} = require('./product')
const { ImageFieldType } = require("./image");
const { SingleProductFieldType } = require("./product");

const tagsFieldObj = {
  id: {type: GraphQLID},
  name: {type: GraphQLString},
  createdAt: {type: GraphQLString}
}
const TagFieldType = new GraphQLObjectType({
  name:'TagFieldType',
  fields:()=>({
  id: {type: GraphQLID},
  name: {type: GraphQLString},
  createdAt: {type: GraphQLString},
  message: {type: GraphQLString},
  })
})


const DetailedTagFieldType = new GraphQLObjectType({
  name: 'DetailedTagFieldType',
  fields:()=>({
    ...tagsFieldObj,
    // services:{type: GraphQLList(DetailedServiceFieldTypes)},
    products:{type: GraphQLList(SingleProductFieldType)}
  })
})

const getServicesByTag = {
  type: DetailedTagFieldType,
  args:{
    name: {type: GraphQLString}
  },
  async resolve(_,args, context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    const tags = await Tag.findOne({
      where:{
        name: args.name
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
          }
        ]
      }
      ]
    })
    return tags
  }
}

const getProductsByTag = {
  type: DetailedTagFieldType,
  args:{
    name: {type: GraphQLString}
  },
  async resolve(_,args, context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    try {
      const tags = await Tag.findOne({
      where:{
        name: args.name
        },
        include:[
          {
          model: Product,
          where:{
              sold: false
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
            }
          ]
        }
        ]
      })
      return tags
    } catch (error) {
      console.log(error)
    }
  }
}

// MUTATIONS
const addServiceTags = {
  type: TagFieldType,
  args: {
    tags: {type: GraphQLString},
    serviceId: {type: GraphQLID}
  },
  async resolve(_, {tags, serviceId}, context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    tags = tags.split(',')
    try {
      const service = await Service.findOne({
        where:{
          id: serviceId,
          userId: user.id
        }
      })
      if (!service){
        throw new Error('There was an error geting the service')
      }
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
      return {
        message: "Tags added"
      }
    } catch (error) {
      return {
        message:"there was an error adding these tags"
      }
    }
  }
}

const addProductTags = {
  type: TagFieldType,
  args: {
    tags: {type: GraphQLString},
    productId: {type: GraphQLID}
  },
  async resolve(_, {tags, productId}, context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    tags = tags.split(',')
    try {
      const product = await Product.findOne({
        where:{
          id: productId,
          userId: user.id
        }
      })
      if (!product){
        throw new Error('There was an error geting the product')
      }
      async function createAndAddTag(tag){
        const newTage = await Tag.create({
          name: tag
        })
        await newTage.addProduct(product)
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
          await tagInst.addProduct(product)
        }
      }
      return {
        message: "Tags added"
      }
    } catch (error) {
      return {
        message:"There was an error adding these tags"
      }
    }
  }
}

const removeProductTag = {
  type: TagFieldType,
  args: {
    tag: {type: GraphQLString},
    productId: {type: GraphQLID}
  },
  async resolve(_,{productId:id, tag},context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
      try {
        const tagInst = await Tag.findOne({
        where:{
          name: tag
        }
      })
      console.log(tagInst)
      if (!tagInst){
        throw new Error('Tag not not used by user')
      }
      const product = await Product.findOne({
        where:{
          userId: user.id,
          id
        }
      })

      await tagInst.removeProduct(product)
      return {
        message: "Tag removed"
      }
    } catch (error) {
      return{
        message: "there was an error removing this tag"
      }
    }
  }
}

const removeServiceTag = {
  type: TagFieldType,
  args: {
    tag: {type: GraphQLString},
    serviceId: {type: GraphQLID}
  },
  async resolve(_,{serviceId:id, tag},context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    try {
      const userService = await user.getServices({
        where:{
          id
        }
      })
      if (!userService[0]){
        return {
          message: "The service does not have this tag"
        }
      }
      const tagInst = await Tag.findOne({
        where:{
          name: tag
        }
      })

      if (!tagInst){
        throw new Error('Tag not used by user')
      }
      await tagInst.removeService(userService[0])
      return {
        message: "Service deleted!"
      }
    } catch (error) {
      return {
        message: "There was an error deleting tag"
      }
    }
  }
}

module.exports = {
  tag_queries:{
    getServicesByTag,
    getProductsByTag
  },
  tag_mutations:{
    addServiceTags,
    addProductTags,
    removeProductTag,
    removeServiceTag
  },
  TagFieldType,
  tagsFieldObj
}


