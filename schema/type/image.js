const axios = require('axios')
const graphql = require("graphql");
const {  User,Product, Image } = require("../../db");
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList } = graphql;
const { GraphQLUpload } = require('graphql-upload');
const {UserFieldType} = require('./user')
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile, getFileStream, deleteImage , presignedGETURL} = require("../s3");
/*
file---> {
  fieldname: 'image',
  originalname: 'download-1.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'uploads/',
  filename: '3e035a98e78381400ad7681cc65a4a3b',
  path: 'uploads/3e035a98e78381400ad7681cc65a4a3b',
  size: 4453
}
----------------
from web = {
  lastModified: 1621959562520
  lastModifiedDate: Tue May 25 2021 12:19:22 GMT-0400 (Eastern Daylight Time) {}
  name: "download.jpg"
  size: 9991
  type: "image/jpeg"
  webkitRelativePath: ""
}

server = file---> {
  fieldname: 'image',
  originalname: 'download.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'uploads/',
  filename: '966c569daf013e7c8d634ac1bf2bde2e',
  path: 'uploads/966c569daf013e7c8d634ac1bf2bde2e',
  size: 9991
}

*/

const PostImageFieldType = new GraphQLObjectType({
  name:"PostImageFieldType",
  fields:()=>({
    fieldname:{type: GraphQLString},
    originalname:{type: GraphQLString},
    encoding:{type: GraphQLString},
    mimetype:{type: GraphQLString},
    destination:{type: GraphQLString},
    filename:{type: GraphQLString},
    path:{type: GraphQLString},
    size:{type: GraphQLID},
    imagePath: {type: GraphQLString},
    imageUrl: {type: GraphQLString}
  })
})

const FileFieldType = new GraphQLObjectType({
  name: 'FileFieldType',
  fields: ()=>({
    filename: {type: GraphQLString},
    mimetype: {type: GraphQLString},
    encoding: {type: GraphQLString},
  })
})

// Types
const ImageFieldType = new GraphQLObjectType({
  name: "Image",
  fields: ()=>({
    id:{type: GraphQLID},
    user: {type: UserFieldType},
    productId: {type: GraphQLID},
    serivceId: {type: GraphQLID},
    file:{type: FileFieldType},
    path: {type: GraphQLString},
    awsImage: {type: GraphQLList(PostImageFieldType)}
  })
})


const PathFieldType = new GraphQLObjectType({
  name: 'Paths',
  fields:()=>({
    path: {type: GraphQLString}
  })
})

// QUERY
const getImage = {
  type: ImageFieldType,
  args:{id:{type: GraphQLID}},
  async resolve(_, args, context){
    // const user = await User.findByToken(context.authenticate)
    return await Image.findByPk(arg.id)
  }
}

const postImages = {
  type: ImageFieldType,
  args:{
    images: {type: GraphQLList(PostImageFieldType)}
  },
  async resolve(_,{images}, context){
    // const user = await User.findByToken(context.authenticate)
    const user =  await User.findByPk(1)

  }
}


// MUTATION
const addProductImage = {
  type: ImageFieldType,
  args: {
    paths: {type: GraphQLString},
    productId: {type: GraphQLID}
  },
  async resolve(_, args, context){
    let {paths,productId} = args
    paths = paths.split(',')
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    for (let i =0; i< paths.length; i++){
      const path =paths[i]
      await Image.create({
        path,
        productId
      })
    }
    return {
      productId,
      user
    }
  }
}

const addServiceImage = {
  type: ImageFieldType,
  args: {
    paths: {type: GraphQLString},
    serviceId: {type: GraphQLID}
  },
  async resolve(_, args, context){
    let {paths,serviceId} = args
    // const user = await User.findByToken(context.authenticate)
    const user = await User.findByPk(1)
    paths = paths.split(',')
    for (let i =0; i< paths.length; i++){
      const path =paths[i]
      await Image.create({
        path,
        serviceId
      })
    }
    return {
      serviceId,
      user
    }
  }
}

const postToAWS = {
  type: ImageFieldType,
  args:{
    fieldname:{type: GraphQLString},
  },
  async resolve(_,args, context){
    // const user = await User.findbyToken(token)
    const user = await User.findByPk(1)
    try {
    const file = args;
    console.log('file--->', file)
    // const result = await uploadFile(file);
    // await unlinkFile(file.path);
    // { imagePath: `${result.Key}`, imageUrl: result.Location }
    return {
      awsImage: {
        imagePath: `${result.Key}`,
        imageUrl: result.Location
      }
    }
    } catch (err) {
      console.log("err", err);
      next(err);
    }
  }
}

const singleUpload = {
  type: PostImageFieldType,
  args:{
    image: {type: GraphQLUpload},
  },
  async resolve(_,{image},context){
    // const user = await User.findByToken(token)
    try {
      console.log('here')
    // const uploadResult = await Storage.upload(image)
    // console.log('uploadedResutl', uploadedResutl)
    return {

    }
    } catch (error) {
      console.log('error-->', error)
    }
    // const user = await User.findByPk(1)

  }
}

module.exports = {
  image_queries:{
    getImage
  },
  image_mutations:{
    addProductImage,
    addServiceImage,
    postToAWS,
    singleUpload
  },
  ImageFieldType
}
