const graphql = require("graphql");

const { GraphQLObjectType, GraphQLSchema } = graphql;
// TYPES
const {tag_queries,tag_mutations,...tagRest} = require("./type/tags");
const { user_queries, user_mutations ,...userRest} = require("./type/user");
const { rating_queries, rating_mutations,...ratingRest } = require("./type/rating");
const { image_queries, image_mutations, ...imageRest } = require("./type/image");
const {product_queries,product_mutations, ...productRest} = require("./type/product");
const {service_queries,service_mutations, ...serviceRest} = require("./type/service");
const {like_mutations} = require("./type/like");



// GET
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    ...user_queries,
    ...product_queries,
    ...image_queries,
    ...rating_queries,
    ...service_queries,
    ...tag_queries,
  },
});

// POST / PUT / DELETE
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    ...user_mutations,
    ...image_mutations,
    ...rating_mutations,
    ...service_mutations,
    ...tag_mutations,
    ...product_mutations,
    ...like_mutations
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});


// api we need

/*
  get user information
    user
    purchases
    likes
    items selling

  products - for home page
    products
    users - assocation information

  creating a product
    users need to be able to seel items

  unlisting an item
    users sholl be able to take items off of the market
    if it is a service it should only be taken off the market not deleted because other people may have baught it

  rate and item
    product, user, and service should be able to be rated

  like an  item
    people should be able ot like a service and product
    maybe people too

  chat - firebase
    people should be able to communicate with eachother so that they can find a place to sell items

  update user information
    it they need to they should be able to update their profile

  marke items as sold
    after an item is sold an peroson shoud be able to update that the item is sold
*/
