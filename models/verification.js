const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    userID : String,
    uniqueString : String,
    createAt : Date,
    expiresAt : Date
    
})
const UserVerfication = mongoose.model('UserVerfication', userSchema);
module.exports = UserVerfication;