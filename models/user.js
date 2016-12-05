var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/taller_facebook');

var userSchema = new Schema({
    name: String,
    provider: String,
    uid: String,
    accessToken: String
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);