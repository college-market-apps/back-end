const router = require('express').Router()
const {
  db,
  User,
  Image,
  Product,
  ProductLike,
  ProductPurchase,
  Rating,
  ServiceLike,
  ServicePurchase,
  Tag,
} = require('../../db')
module.exports = router
