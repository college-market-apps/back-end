const db = require("../database");
const Sequelize = require("sequelize");


const Product = db.define('product', {
  // name: {
  //   type: Sequelize.STRING,
  //   allowNull: false
  // },
  price: {
    type: Sequelize.INTEGER, // in pennies
    allowNull: false,
    min: 0
  },
  title:{
    type: Sequelize.STRING,
    allowNull: false
  },
  description:{
    type: Sequelize.TEXT,
    // allowNull: false
  },
  placesCanMeet:{ // all the buildings user can meet at
    type: Sequelize.TEXT,
    allowNull: true
  },
  sold: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  condition: {
    type: Sequelize.STRING //.STRING,//(['like new', 'fair','used', 'definitly used'])
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
})

module.exports = Product
