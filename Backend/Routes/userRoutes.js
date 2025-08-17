const express = require("express");
const bcrypt = require("bcrypt");
const routes = express.Router();

const Schema = require("../Schema/userSchema");

routes.get("/dashboard", async(req, res) => {
    try {
        const response = await Schema.find();
        if(response.length === 0) {
            return res.status(404).json({
                message: "No data found!",
            })
        }

        return res.status(200).json({
            users: response,
        })
    } catch(err) {
        return res.status(500).json({
            message: "Internal server error",
            Error: err.message,
        })
    }
});

routes.post("/sign-up", async(req, res) => {
    try {
        const { userName, email, skills, password } = req.body;

        if(!userName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            })
        }
        const hashed = await bcrypt.hash(password, 10);
        const newUser = new Schema({
            userName: userName,
            email: email,
            skills: skills,
            password: hashed
        });
        await newUser.save();

        return res.status(201).json({
            message: "User Saved!",
        })
    } catch(err) {
        return res.status(500).json({
            message: "Internal server error",
            Error: err.message,
        })
    }
});

routes.post("/sign-in", async(req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            })
        }

        const loginAuth = await Schema.findOne({ email });
        if(!loginAuth) {
            return res.status(404).json({
                message: "User not found!"
            })
        }

        const passMatch = await bcrypt.compare(password, loginAuth.password);
        if(!passMatch) {
            return res.status(401).json({
                message: "Incorrect password",
            })
        }

        return res.status(201).json({
            message: "Sign-In Successfull!",
            loginData: loginAuth,
        })
    } catch(err) {
        return res.status(500).json({
            message: "Internal server error",
            Error: err.message,
        })
    } 
})


routes.get("/user/:id", async (req, res) => {
  try {
    const user = await Schema.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      Error: err.message,
    });
  }
});



module.exports = routes;