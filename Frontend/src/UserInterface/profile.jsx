import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const Profile = () => {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [newSkill, setNewSkill] = useState("");

    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");

    const getUser = async () => {
        const response = await fetch(`http://localhost:5000/user/user/${userId}`);
        const data = await response.json();
        if (response.ok) {
        setUser(data.user);
        }
    };

    const addSkill = async () => {
        if (!newSkill){ 
            return console.log("Enter a skill");
        }

        const response = await fetch(`http://localhost:5000/skills/add-skill/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skill: newSkill }),
        });

        const data = await response.json();
        if (response.ok) {
            setUser(data.user);
            setNewSkill("");
        } else {
            alert(data.message);
        }
    };

    const removeSkill = async (skill) => {
        const response = await fetch(`http://localhost:5000/skills/remove-skill/${userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skill }),
        });

        const data = await response.json();
        if (response.ok) {
            setUser((prev) => ({ ...prev, skills: data.skills }));
        } else {
            alert(data.message);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    if (!user){
         return <p>Loading profile...</p>;
    }

return (
  <div className="profile-container">
    <h2>Welcome, {userName}</h2>
    <h2>Email: {localStorage.getItem("email")}</h2>
    <h2>Credits: {localStorage.getItem("credit")}</h2>

    <h3>Your Skills</h3>
    <ul className="skills-list">
      {user.skills.length > 0 ? (
        user.skills.map((skill, index) => (
          <li key={index}>
            {skill.charAt(0).toUpperCase() + skill.slice(1)} <button onClick={() => removeSkill(skill)}><X size={16} /></button>
          </li>
        ))
      ) : (
        <p>None</p>
      )}
    </ul>

    <div className="add-skill">
      <input
        type="text"
        placeholder="New Skill"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
      />
      <button onClick={addSkill}>Add Skill</button>
    </div>

    <div className="profile-actions">
      <button onClick={() => navigate("/dashboard")}>Back</button>
      <button onClick={() => { localStorage.clear(); navigate("/"); }}>Log-Out</button>
    </div>
  </div>
);
};

export default Profile;
