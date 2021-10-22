const db = require("../database");
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const School = require('./School')
require("dotenv").config();

const profileImages = ['https://us.123rf.com/450wm/jly19/jly191706/jly19170600011/79525407-avatar-man-in-modern-flat-design-vector-illustration.jpg?ver=6', 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg','https://i0.wp.com/365webresources.com/wp-content/uploads/2016/09/FREE-PROFILE-AVATARS.png?resize=502%2C494&ssl=1','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO5TKgoVq-iXS7KBZFLXxhwanH1iycLUEp0OfO1GVMIHdgY7FWdRZoAzpCStdBhWQ9lIk&usqp=CAU','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXXSUH0cET_cc7P5gyJ9C-CNMmBbU4_VmQ2wus_cMGVwTkC9TE1QKFassNN_cYM0TZync&usqp=CAU','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNMigcti3QIcvX5jSF29YXu_pY5kRjy1ace-hnOe_aek4u68vMWRxcW6f4iUqchttYbpQ&usqp=CAU','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWvShlx6h3k2uAzCBU_IyL7mLy61EsKvMK98URg1uAcUtjt3Ty_tq3-d6Uo3IkNzTVwSo&usqp=CAU']
const randNum = Math.floor(Math.random() * profileImages.length)
const randImage = profileImages[randNum]
const User = db.define("user", {
  name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  profileImage:{
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: randImage
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  school: {
    type: Sequelize.STRING,
    allowNull: true,
    // should be enumerated in the future
  },
  firebaseID: {
    type: Sequelize.STRING,
    allowNull: true // in the futrue false
  },
  uid: {
    type: Sequelize.STRING,
    allowNull: true // in the futrue false
  },
  createdAt:{
    type: Sequelize.DATE,
    defaultValue: new Date(),
    get(){
      const date = this.getDataValue('createdAt');
      return date.toString()
    },
    set(val){
      const date = this.getDataValue('createdAt');
      this.setDataValue('createdAt',new Date(val));
    }
  }
});

module.exports = User

/**
 * instanceMethods
 */
User.prototype.correctPassword = function (candidatePwd) {
  //we need to compare the plain version to an encrypted version of the password
  return bcrypt.compare(candidatePwd, this.password);
};

User.prototype.generateToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT);
};

/**
 * classMethods
 */
User.authenticate = async function ({ username, password }) {
  const user = await this.findOne({ where: { username } });
  if (!user || !(await user.correctPassword(password))) {
    const error = Error("Incorrect username/password");
    error.status = 401;
    throw error;
  }

  return user.generateToken();
};

User.findByToken = async function (token) {
  try {
    const { id } = await jwt.verify(token, process.env.JWT);
    const user = User.findOne({
      where: {
        id
      },
      include: School
    });
    if (!user) {
      throw "nooo";
    }
    return user;
  } catch (ex) {
    const error = Error("bad token");
    error.status = 401;
    throw error;
  }
};

/**
 * hooks
 */
const hashPassword = async (user) => {
  //in case the password has been changed, we want to encrypt it with bcrypt
  if (user.password.length < 4) {
    const error = Error("Password must be at least 4 letters");
    error.status = 401;
    throw error;
  }
  if (user.username.length < 4) {
    const error = Error("Username must be at least 4 letters");
    error.status = 401;
    throw error;
  }
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
};


// User.beforeCreate(hashPassword);
// User.beforeUpdate(hashPassword);
// User.beforeBulkCreate((users) => {
//   users.forEach(hashPassword);
// });
