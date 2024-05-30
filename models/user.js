const mongoose = require("mongoose");

// Define the schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create the model
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
