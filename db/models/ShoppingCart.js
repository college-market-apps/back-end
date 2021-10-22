const db = require("../database");
const Sequelize = require("sequelize");

const ShoppingCart = db.define('shoppingCart',{
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
    groupId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isBlocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    blockedBy: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

module.exports = ShoppingCart
