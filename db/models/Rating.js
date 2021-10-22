const db = require("../database");
const Sequelize = require("sequelize");

const Rating = db.define('rating', {
  description: {
    type: Sequelize.STRING, // shouldn't be long
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

module.exports = Rating
