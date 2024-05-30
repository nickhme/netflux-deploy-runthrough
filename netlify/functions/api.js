const serverless = require('serverless-http')

require("dotenv").config();
require('ejs')
const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const session = require("express-session");

const mongoose = require("mongoose");
const Movies = require("../../models/movies");
const authRouter = require("../../controllers/authController");

const app = express();
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI);
app.use(methodOverride("_method"));

// ! I need to tell express to expect data from our form
app.use(express.urlencoded({ extended: false }));
// ! adding css
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SECRET_PASSWORD, // Replace with a strong secret key
    resave: false, // Forces the session to be saved back to the store, even if it wasn't modified
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
    cookie: { secure: false }, // Secure should be true in production if you're using HTTPS
  })
);

app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message;
    req.session.message = null;
  }
  next();
});

app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

// ! Added this route.
app.get("/new-movie", (req, res) => {
  res.render("new.ejs");
});

app.get("/movies", async (req, res) => {
  try {
    const movies = await Movies.find();
    res.render("movies.ejs", {
      movies: movies,
    });
  } catch (error) {
    res.render("error.ejs", { error: error.message });
  }
});

app.get("/movies/:movieId", async (req, res) => {
  try {
    const movie = await Movies.findById(req.params.movieId);
    console.log(movie);
    res.render("show.ejs", {
      movie,
    });
  } catch (error) {
    res.render("error.ejs", { error: error.message });
  }
});

app.post("/movies", async (req, res) => {
  if (req.session.user) {
    try {
      // add the current users ID to the request body
      req.body.createdBy = req.session.user.userId;
      const movie = await Movies.create(req.body);
      req.session.message = "Movie successfully created.";
      // ! I'm now going to redirect to a different page.
      // ! Redirects to movies
      res.redirect("/movies");
      // ! If we wanted to redirect to the new `/movies/movieId` we'd need something like:
      // res.redirect(`/movies/${movie._id}`) Z
    } catch (error) {
      req.session.message = error.message;
      res.redirect("/movies");
      // res.render("error.ejs", { error: error.message });
    }
  } else {
    res.redirect("/auth/sign-in");
  }
});

app.delete("/movies/:movieId", async (req, res) => {
  if (req.session.user) {
    try {
      const deletedMovie = await Movies.findByIdAndDelete(req.params.movieId);
      res.send(deletedMovie);
    } catch (error) {
      res.render("error.ejs", { error: error.message });
    }
  } else {
    res.redirect("/auth/sign-in");
  }
});

app.put("/movies/:movieId", async (req, res) => {
  if (req.session.user) {
    try {
      const updatedMovie = await Movies.findByIdAndUpdate(
        req.params.movieId,
        req.body,
        { new: true }
      );
      res.send(updatedMovie);
    } catch (error) {
      res.render("error.ejs", { error: error.message });
    }
  } else {
    res.redirect("/auth/sign-in");
  }
});

app.get("/movies/:movieId/reviews", (req, res) => {
  res.render("newReview.ejs", { movieId: req.params.movieId });
});

// create a review
app.post("/movies/:movieId/reviews", async (req, res) => {
  // if the user is signed in then:
  if (req.session.user) {
    // get the id of the movie we are going to add the review to
    const movieId = req.params.movieId;
    // get that movie from the database
    const movieFromDb = await Movies.findById(movieId);
    // we should have the review in the req.body
    // add the reviewers id to the req.body as 'reviewer'
    req.body.reviewer = req.session.user.userId;
    // push the new review into the movies reviews key
    movieFromDb.reviews.push(req.body);
    // save the movie with the new review
    await movieFromDb.save();
    // redirect the user to the
    res.redirect(`/movies/${movieId}`);
  } else {
    res.redirect("/auth/sign-in");
  }
});

module.exports.handler = serverless(app)