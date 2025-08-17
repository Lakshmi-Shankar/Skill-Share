const express = require("express");
const User = require("../Schema/userSchema");
const routes = express.Router();

routes.post("/add-skill/:id", async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ 
        message: "Skill is required" 
    });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ 
        message: "User not found" 
    });

    user.skills.push(skill);
    await user.save();

    return res.status(200).json({ 
        message: "Skill added", 
        skills: user.skills 
    });
  } catch (err) {
    return res.status(500).json({ 
        message: "Internal server error", 
        error: err.message 
    });
  }
});


routes.delete("/remove-skill/:id", async (req, res) => {
  try {
    const { skill } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ 
        message: "User not found" 
    });

    user.skills = user.skills.filter(s => s !== skill);
    await user.save();

    return res.status(200).json({ 
        message: "Skill removed", 
        skills: user.skills 
    });
  } catch (err) {
    return res.status(500).json({ 
        message: "Internal server error", 
        error: err.message 
    });
  }
});

module.exports = routes;
