const { User, School } = require("../db");
const auth = require('../firebase')

const requireToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = await User.findByToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const isAdmin = (req, res, next) => {
  console.log(req.user);
  if (!req.user.isAdmin) {
    res.status(403).send("You shall not pass!");
  } else {
    next();
  }
};

const requireFBToken = async (req, res, next)=>{
  const { fbtoken } = req.headers
  try {
    if (!fbtoken ) res.status(403).send("You shall not pass!");
    const { uid } = await auth.verifyIdToken(fbtoken)
    req.uid = uid
    next()
  } catch (error) {
    next()
  }
}

const requireFBUser = async (req, res, next)=>{
  const { fbtoken } = req.headers
  try {
    if (!fbtoken ) return res.status(403).send("You shall not pass!");
    const { uid } = await auth.verifyIdToken(fbtoken)
    if (!uid) return res.status(403).send("You shall not pass!")
    const user = await User.findOne({ where: { uid }, include: School })
    if (!user) return res.status(403).send("You shall not pass!")
    req.uid = uid
    req.user = user
    next()
  } catch (error) {
    next()
  }
}

module.exports = {
  requireToken,
  isAdmin,
  requireFBToken,
  requireFBUser
};
