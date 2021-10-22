const db = require("./database");

const User = require('./models/User');
const Image = require('./models/Image');
const Product = require('./models/Product');
const Rating = require('./models/Rating');
const Tag = require('./models/Tag');
const School = require('./models/School') //school
const Purchase = require('./models/Purchase')
const Like = require('./models/Like')
const ShoppingCart = require('./models/ShoppingCart')



//associations

// User
User.hasMany(Rating)
Rating.belongsTo(User)
// User.hasOne(Purchase)
School.belongsToMany(User, {through: 'user_school'})
User.belongsToMany(School, {through: 'user_school'})

// selling product/ all products
User.hasMany(Product)
Product.belongsTo(User)
Product.belongsToMany(School,{through: 'product_school'})
School.belongsToMany(Product,{through: 'product_school'})

//likes
User.hasOne(Like)
Like.belongsToMany(Product,{through:'product_like'})
Product.belongsToMany(Like,{through:'product_like'})

// Image
Product.hasMany(Image)
Image.belongsTo(Product)

// Purchase
User.hasOne(Purchase) // because of through table
Purchase.belongsTo(User)
Purchase.hasMany(Product)
Product.belongsTo(Purchase)

// Tags
Product.belongsToMany(Tag,{through:'product_tag'})
Tag.belongsToMany(Product,{through:'product_tag'})

// ShoppingCart
ShoppingCart.belongsToMany(User, {through: 'user_shoppingcart'})
User.belongsToMany(ShoppingCart, {through: 'user_shoppingcart'})
ShoppingCart.belongsToMany(Product, {through: 'shoppingcart_product'})

module.exports = {
  db,
  User,
  Image,
  Product,
  Rating,
  Tag,
  School,
  Purchase,
  Like,
  ShoppingCart
};
