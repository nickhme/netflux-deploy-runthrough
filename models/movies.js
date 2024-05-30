const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    reviewer: { type: mongoose.Schema.ObjectId, required: true, ref: "user" },
  },
  { timestamps: true }
);

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  rating: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  reviews: [reviewSchema],
});

module.exports = mongoose.model("Movie", movieSchema);
