const db = require("../database");
const Sequelize = require("sequelize");

const Image = db.define('image',{
  path: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'https://www.level10martialarts.com/wp-content/uploads/2017/04/default-image-620x600.jpg'
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
  },
  isAWS: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
})

module.exports = Image
