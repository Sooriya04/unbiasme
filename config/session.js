const session = require("express-session");
const MongoStore = require("connect-mongo");

console.log("Session configuration initialized successfully");

module.exports = session({
  secret: process.env.SESSION_SECRET || "yourSecretKey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 3 * 60 * 60, // 3 hours
    autoRemove: "native",
  }),
});
