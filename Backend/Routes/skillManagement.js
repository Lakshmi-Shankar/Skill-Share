const express = require("express");
const User = require("../Schema/userSchema");
const routes = express.Router();

routes.put("/add-skill/:id", async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ 
      message: "Skill is required" 
    });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ 
      message: "User not found" 
    });

    const normalizedSkill = skill.trim().toLowerCase();
    if (user.skills.includes(normalizedSkill)) {
      return res.status(400).json({ 
        message: "Skill already exists" 
      });
    }

    user.skills.push(normalizedSkill);
    await user.save();

    return res.status(200).json({ 
        message: "Skill added", 
        user 
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
