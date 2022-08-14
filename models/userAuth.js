const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String, 
        required: true,
        unique: true // Safe to add if validation middleware is created
    }
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);