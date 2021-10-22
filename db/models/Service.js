const db = require("../database");
const Sequelize = require("sequelize");


const Service = db.define('service', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description:{
    type: Sequelize.TEXT,
    allowNull: false
  },
  price:{
    type: Sequelize.INTEGER,
    allowNull: false,
    min: 0
  },
  isActive:{
    type:Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
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

module.exports = Service
