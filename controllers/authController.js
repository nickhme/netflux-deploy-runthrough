const express = require("express");
const authRouter = express.Router();
const UserModel = require("../models/user.js");
const bcrypt = require("bcrypt");

authRouter.get("/sign-up", (req, res) => {
  return res.render("auth/sign-up.ejs");
});

authRouter.post("/sign-up", async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  console.log(req.body.password)
  req.body.password = hash;
  console.log(req.body.password)

  try {
    const userIdDb = await UserModel.findOne({ username: req.body.username });
    console.log(userIdDb)

    if (userIdDb) {
      throw new Error("Username already taken");
    }
    
    const newUser = await UserModel.create(req.body);
    console.log(newUser)

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.render("auth/sign-up.ejs", { error: error.message });
  }
});

authRouter.get("/sign-in", (req, res) => {
  return res.render("auth/sign-in.ejs");
});

authRouter.post("/sign-in", async (req, res) => {
  try {
    const userFromDatabase = await UserModel.findOne({
      username: req.body.username,
    });

    console.log(req.body.password)
    console.log(userFromDatabase)

    const passwordsMatch = await bcrypt.compare(
      req.body.password, // hash this password
      userFromDatabase.password
    );

    console.log(userFromDatabase);

    req.session.user = {
      username: userFromDatabase.username,
      userId: userFromDatabase._id,
    };

    if (passwordsMatch) {
      res.redirect("/");
    } else {
      return res.send(`Login Failed`);
    }
  } catch (error) {
    console.log(error)
    res.render("error.ejs", { message: error.message });
  }
});

module.exports = authRouter;
