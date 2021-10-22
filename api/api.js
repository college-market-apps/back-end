const router = require('express').Router()
module.exports = router

router.use("/auth", require("./models/auth"));
router.use("/users", require("./models/user"));
router.use("/images", require("./models/image"));

router.use("/products/likes", require("./models/productLikes"));
router.use("/products/tags", require("./models/productTags"));
router.use("/products", require("./models/product"));

router.use("/services/tags", require("./models/serviceTags"));
router.use("/services/ratings", require("./models/rating"));
router.use("/services/likes", require("./models/serviceLikes"));
router.use("/services", require("./models/service"));
router.use("/shoppingcart", require("./models/shoppingCart"));
router.use("/purchases", require("./models/purchase"));


