const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,

  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  following: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ]
});

module.exports = mongoose.model("User", UserSchema);
