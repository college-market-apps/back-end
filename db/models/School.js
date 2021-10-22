const db = require("../database");
const Sequelize = require("sequelize");


const School = db.define('school', {
  name: {
    type: Sequelize.STRING
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

module.exports = School
