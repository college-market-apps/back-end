const graphql = require("graphql");
const { User, Product, School, Image, Tag } = require("../../db");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;


function productDetail(){
  return [
        {
        model:Product,
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
}

const { UserFieldType } = require("./user");
const { ImageFieldType } = require("./image");
// const { TagFieldType } = require("./tags");

const TagFieldType = new GraphQLObjectType({
  name:'ProductTagFieldType',
  fields:()=>({
  id: {type: GraphQLID},
  name: {type: GraphQLString},
  createdAt: {type: GraphQLString}
  })
})

const SingleProductFieldType = new GraphQLObjectType({
  name:'SingleProductFieldType',
  fields:()=>({
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
  sucess:{type: GraphQLBoolean},
  message:{type: GraphQLString},
  images: { type: GraphQLList(ImageFieldType) },
  tags: { type: GraphQLList(TagFieldType) },
  user: { type: UserFieldType },
})
})

const MultiProductsFeildType = new GraphQLObjectType({
  name: "MultiProductsFeildType",
  fields: () => ({
    type: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    products: { type: GraphQLList(SingleProductFieldType) },
  }),
});

// QUERY

const getProductsBySchool = {
  type: MultiProductsFeildType,
  args: {
    schoolId: {type: GraphQLID}
  },
  async resolve(_, {schoolId}, context) {
    // const user = await User.findByToken(context.authenticate);
    try {
      const user = await User.findByPk(1);
      const userSchools = await user.getSchools()
      const schoolProducts = await School.findOne({
        where:{
          id: schoolId
        },
        include: productDetail()
      });
      return schoolProducts
    } catch (error) {
      console.log('error geting products by school-->',error)
    }
  },
};

const getUserProducts = {
  type: MultiProductsFeildType,
  async resolve(_, {schoolId}, context) {
    // const user = await User.findByToken(context.authenticate);
    const user = await User.findByPk(1);
    const products = await user.getProducts({
      include: [
        {
          model: Image
        },
        {
          model: Tag
        }
      ]
    })
    return {
      products
    }
  },
};

const getUserProductLikes = {
  type: MultiProductsFeildType,
  async resolve(_, __, context) {
    // const user = await User.findByToken(context.authenticate);
    try {
      const user = await User.findByPk(1);
      const productLikes = await user.getLike({
        include: [
          {
          model:Product,
          where:{
            sold: false
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
        products : productLikes?.products
      }
    } catch (error) {
      console.log('error', error)
    }
  },
};

const getProduct = {
  type: SingleProductFieldType,
  args: {
    productId: { type: GraphQLID },
  },
  async resolve(_, {productId}, context) {
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1);
    const product = await Product.findOne({
      where: {
        id:productId,
      },
      include: [
        {
          model:User
        },
        {
          model: Image
        },
        {
          model: Tag
        }
      ]
    })
    return product
  }
};

const createProduct = {
  type: SingleProductFieldType,
  args: {
    title: {type: GraphQLString},
    description: {type: GraphQLString},
    placesCanMeet: {type: GraphQLString},
    condition: {type: GraphQLString},
    price: {type: GraphQLInt},
    schoolId: {type: GraphQLID},
  },
  async resolve(_, args,context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1);
    let schoolId = args.schoolId
    if (!schoolId){
      const userSchools = await user.getSchools()
      schoolId = userSchools[0].id
      console.log('user schoolId--->', schoolId)
    }
    delete args.schoolId
    const newProduct = await Product.create({...args, sold: false, userId: user.id})
    console.log('schoolId--->',schoolId)
    await newProduct.addSchool(schoolId)
    return newProduct
  }
}

const sellProduct = {
  type: SingleProductFieldType,
  args: {
    productId: {type: GraphQLID},
  },
  async resolve(_, {productId},context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1);
    try {
      const updatedProduct = await Product.update({sold: true},{
        where:{
          id: productId,
          userId: user.id
        }
      })
      return {
        message: 'Product Sold!'
      }
    } catch (error) {
      return {
        message: 'There was an error selling your product'
      }
    }
  }
}

const updateProduct = {
  type: SingleProductFieldType,
  args: {
    productId: {type: GraphQLID},
    name: {type: GraphQLString},
    title: {type: GraphQLString},
    description: {type: GraphQLString},
    placesCanMeet: {type: GraphQLString},
    condition: {type: GraphQLString},
    price: {type: GraphQLInt},
  },
  async resolve(_, args,context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1);
    const updatingObj = Object.keys(args).reduce((accum, key)=>{
      if (!args[key]){
        return accum
      }
      accum[key] = args[key]
      return accum
    },{})

    try {
      const updatedProduct = await Product.update(updatingObj,{
        where:{
          id: args.productId,
          userId: user.id
        }
      })
      return {
        message: 'Product Updated!'
      }
    } catch (error) {
      // console.log(error)
      return {
        message: 'There was an error updating your product'
      }
    }
  }
}


const removeProductLike = {
  type: SingleProductFieldType,
  args:{
    productId: {type: GraphQLID}
  },
  async resolve(_,{productId}, context){
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1);
    try {
      let userLikes = await user.getLike()
      if (!userLikes){ // user does not have likes yet
        return {
          message: 'You have no products to unlike'
        }
      }
      const res = await userLikes.removeProduct(productId)
      return {
        sucess: true,
        message: 'Product removed'
      }//userLikes
    } catch (error) {
      console.error(error)
      let message = 'There was an error unliking this project'
      return {
        sucess: false,
        message
      }
    }
  }
}

const addProduct = {
  type: SingleProductFieldType,
  args:{
    name: {type: GraphQLString},
    price: {type: GraphQLInt},
    title: {type: GraphQLString},
    description: {type: GraphQLString},
    placesCanMeet: {type: GraphQLString},
    condition: {type: GraphQLString},
  },
  async resolve(_,args,context){
    // const user = await User.findByToken(context.authenticate)
    try {
      const user = await User.findByPk(1)
    args.userId = user.id // create user relashonship
    const newProduct = await Product.create(args)
    console.log(newProduct)
    return newProduct
    } catch (error) {
      console.log('errorr--->', error)
    }
  }
}

const deleteProduct = {
  type: SingleProductFieldType,
  args:{
    productId: {type: GraphQLID}
  },
  async resolve(_,{productId},context){
    // const user = await User.findByToken(context.authenticate)
    try {
      const user = await User.findByPk(1)
      const product = await Product.findOne({
        where:{
          id: productId,
          userId: user.id
        }
      })
      if (!product){
        throw new Error('Not a valid product to delete')
      }
      await product.destroy()
      return {
        message: "Product deleted"
      }
    } catch (error) {
      console.log('errorr--->', error)
      return {
        message: error
      }
    }
  }
}



module.exports = {
  product_queries: {
    getProductsBySchool,
    getProduct,
    getUserProducts,
    getUserProductLikes
  },
  product_mutations: {
    removeProductLike,
    // addProduct,
    createProduct,
    sellProduct,
    updateProduct,
    deleteProduct
  },
  SingleProductFieldType,
  MultiProductsFeildType
};
