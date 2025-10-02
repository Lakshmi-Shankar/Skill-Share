import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Cookie } from 'lucide-react';
import "../styles/Interface.css";

const InspectProfile = () => {
  const { id } = useParams(); // user id from URL
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [offerSkill, setOfferSkill] = useState("");
  const [wantSkill, setWantSkill] = useState("");
  const [message, setMessage] = useState("");

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/user/user/${id}`);
      const data = await response.json();
      if (response.ok) setUser(data.user);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleSendRequest = async () => {
    const fromUser = localStorage.getItem("userId"); // current logged-in user
    const toUser = id;

    if (!offerSkill || !wantSkill) {
      setMessage("Please enter both skills.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/request/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUser, toUser, offerSkill, wantSkill }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("Request sent successfully!");
        setOfferSkill("");
        setWantSkill("");
      } else {
        setMessage(data.message || "Error sending request");
      }
    } catch (err) {
      console.error(err.message);
      setMessage("Error sending request");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="inspect-profile">
      <h2>{user.userName}'s Profile <Cookie /></h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p>
        <strong>Skills:</strong>{" "}
        {user.skills.length > 0
          ? user.skills.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)).join(", ")
          : "None"}
      </p>

      {/* Request Form */}
      <div className="request-form">
        <h3>Send a Skill Request</h3>
        <input
          type="text"
          placeholder="Your skill to offer"
          value={offerSkill}
          onChange={(e) => setOfferSkill(e.target.value)}
        />
        <input
          type="text"
          placeholder={`Skill you want from ${user.userName}`}
          value={wantSkill}
          onChange={(e) => setWantSkill(e.target.value)}
        />
        <button onClick={handleSendRequest}>Send Request</button>
        {message && <p className="request-message">{message}</p>}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Back to Dashboard</button>
      </div>
    </div>
  );
};

export default InspectProfile;
