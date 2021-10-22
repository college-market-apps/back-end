const db = require("../database");
const Sequelize = require("sequelize");

const Purchase = db.define('purchase', {
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

module.exports = Purchase
