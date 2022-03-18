const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/key");
const userModel = require("../models/users");

exports.loginCheck = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"] || req.headers['authorization'];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
}

exports.isAuth = (req, res, next) => {
  let { loggedInUserId } = req.body;
  if (!loggedInUserId || !req.user._id || loggedInUserId !== req.user._id) {
    res.status(401).json({ error: "you are not authenticate" });
  }
  next();
}

exports.isAdmin = (req, res, next) => {
  //If user role 0 is customer not admin
  userModel.findById(req.body.loggedInUserId)
    .then(user => {
      if (user.userRole === 0) {
        res.status(403).json({ error: "Access denied" });
      }
      next();
    })
    .catch(err => {
      res.status(404).json({
        error: error.message
      })
    })
}
