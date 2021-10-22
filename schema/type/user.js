const graphql = require("graphql");
const {  User,School } = require("../../db");
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList } = graphql;
const { presignedGETURL } = require("../s3");
// Types
const SingleSchoolTypeField = new GraphQLObjectType({
  name:'SingleSchoolTypeField',
  fields:()=>({
    id: {type: GraphQLID},
    name: {type: GraphQLString},
  })
})

const UserFieldType = new GraphQLObjectType({
  name: "User",
  fields: ()=>({
    id:{type: GraphQLID},
    name: {type: GraphQLString},
    email: {type: GraphQLString},
    uid: {type: GraphQLString},
    school: {type: GraphQLString},
    firebaseID: {type: GraphQLString},
    token:{type: GraphQLString},
    profileImage:{type: GraphQLString},
    schools:{type: GraphQLList(SingleSchoolTypeField)},
    createdAt: {type: GraphQLString}
  })
})

// QUERY

const getUser = {
  type: UserFieldType,
  async resolve(_,args,{authorization}){
    // const user = await User.findByToken(authorization);
    const userData = await User.findOne({
      where:{
        id: user.id
      },
      include:{
        model: School
      }
    });
    console.log('user req,', userData)
    return userData
  }
}
const searchUser = {
  type: UserFieldType,
  args:{
    userId: {type: GraphQLID}
  },
  async resolve(_,{userId},{authorization}){
    // const user = await User.findByToken(authorization);
    const userData = await User.findOne({
      where:{
        id: userId
      },
      include:{
        model: School
      }
    });
    return userData
  }
}

const login = {
  type: UserFieldType,
  args:{
    firebaseID: {type: GraphQLString},
  },
  async resolve(parent, args) {

    const user = await User.findOne({
      firebaseID: args.firebaseID
    });
    if (!user){
      throw new Error('no a valid user')
    }
    const token = user.generateToken()
    return { token };
  },
};



const getToken = {
  type: UserFieldType,
  args:{
    id: {type: GraphQLID}
  },
  async resolve(_,args, content){
    const user = await User.findByPk(1)
    const token = await user.generateToken()
    return{
      token
    }
  }
}

// MUTATIONS
const addUser = {
  type: UserFieldType,
  args: {
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    schoolId: { type: GraphQLString },
    uid: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    let newUser = await User.create(args)
    async function addSchool(){
      const school = await School.findOne({
        where: {
          id: args.schoolId
        }
      })
      await school.addUser(newUser)
    }
    if (args.schoolId) {
      await addSchool()
      newUser.schools = await newUser.getSchools()
    }

    return newUser;
  },
};

const signUp = {
  type: UserFieldType,
  args:{
    email: {type: GraphQLString},
    uid: {type: GraphQLString}
  },
  async resolve(parent, args) {
    const user = await User.create(args);
    if (!user){
      throw new Error('error signing up')
    }
    const token = await user.generateToken()
    return {
      token,
      ...user.toJSON(),
    };
  },
};

const getSignedUrl = {
  type: new GraphQLObjectType({
    name:"SignedUrlFieldType",
    fields:()=>({
      url: {type: GraphQLString}
    })
  }),
  args:{
    key: {type: GraphQLString}
  },
  async resolve(_,{key}, context){
    try {
      const url = presignedGETURL(key)
      return {
        url
      }
    } catch (error) {
      console.log('error', error)
    }
  }
}

const signUpByUid = {
  type:UserFieldType,
  args:{
    uid: {type: GraphQLString},
  },
  async resolve(_,{uid}){
    const user = await User.create()
  }
}

const loginByUid = {
  type: UserFieldType,
  args:{
    uid: {type: GraphQLString},
  },
  async resolve(_,{uid}, context){
    try {
      const user = await User.findOne({
      where:{
        uid
      }
    })
    const token = await user.generateToken()
    return {
      ...user.toJSON(),
      token
    }
    } catch (error) {
      console.log('error--->',error)
      return
    }
  }
}

const loginByToken = {
  type: UserFieldType,
  args:{
    token: {type: GraphQLString}
  },
  async resolve(_,{token}){
    const user = await User.findByToken(token)
    return user
  }
}




module.exports = {
  user_queries: {
    getUser,
    searchUser,
    getSignedUrl,
    loginByToken
  },
  user_mutations: {
    signUp,
    login,
    addUser,
    loginByUid
  },
  UserFieldType,
};
