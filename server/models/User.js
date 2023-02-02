const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    ethHash: {type: String, required: false},
    username:{ type: String, required: false},
    email: { type: String, required: false },
    hashedPassword: { type: String, required: false },
    imageUrl: {type: String, default: ''},
    isAdmin: {type: Boolean, default: false},
    likedCoin: [{ type: String, default: '' }],
    resetToken: { type: String },
    resetExpireToken: {type: Date}
});


const User = model('User', userSchema);

module.exports = User;