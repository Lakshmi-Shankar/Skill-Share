import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Cookie } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import "../styles/Interface.css";

const InspectProfile = () => {
  const { id } = useParams(); // user being inspected
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerSkill, setOfferSkill] = useState("");
  const [wantSkill, setWantSkill] = useState("");
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [requestAccepted, setRequestAccepted] = useState(false);

  const currentId = localStorage.getItem("userId");

  // --- Socket Setup ---
  useEffect(() => {
    const socket = io("http://localhost:5000");

    // Join current user room
    socket.emit("joinUser", currentId);

    // Sender gets toast when request accepted
    socket.on("requestAccepted", ({ message, fromUserId }) => {
      toast.success(message);
    });

    // Receiver gets chat button when request accepted
    socket.on("requestAcceptedForReceiver", async ({ fromUserId }) => {
      try {
        const chatRes = await fetch("http://localhost:5000/chat/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userA: currentId, userB: fromUserId }),
        });
        const chatData = await chatRes.json();
        if (chatRes.ok) {
          setChatId(chatData.chat._id);
          setRequestAccepted(true);
          toast.success("Chat is now available!");
        }
      } catch (err) {
        console.error(err.message);
      }
    });

    return () => socket.disconnect();
  }, [currentId]);

  // --- Fetch user profile ---
  const fetchUser = async () => {
    try {
      const res = await fetch(`http://localhost:5000/user/user/${id}`);
      const data = await res.json();
      if (res.ok) setUser(data.user);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
    }
  };

const checkRequestAndChat = async () => {
  try {
    const res = await fetch(
      `http://localhost:5000/request/status/${currentId}/${id}`
    );
    const data = await res.json();

    if (res.ok && data.request && data.request.status === "ACCEPTED") {
      setRequestAccepted(true);

      // Create or fetch chat
      const chatRes = await fetch("http://localhost:5000/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userA: currentId, userB: id }),
      });
      const chatData = await chatRes.json();
      if (chatRes.ok) setChatId(chatData.chat._id);
    } else {
      setRequestAccepted(false);
    }
  } catch (err) {
    console.error(err.message);
  }
};


  useEffect(() => {
    fetchUser();
    checkRequestAndChat();
  }, [id]);

  // --- Send skill request ---
  const handleSendRequest = async () => {
    if (!offerSkill || !wantSkill) {
      setMessage("Please enter both skills.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/request/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUser: currentId,
          toUser: id,
          offerSkill,
          wantSkill,
        }),
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
      <h2>
        {user.userName}'s Profile <Cookie />
      </h2>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Skills:</strong>{" "}
        {user.skills.length > 0
          ? user.skills
              .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
              .join(", ")
          : "None"}
      </p>

      {/* Show chat if request accepted */}
      {requestAccepted ? (
        <button
          className="chat-button"
          onClick={() => navigate(`/chat/${chatId}`)}
        >
          💬 Open Chat
        </button>
      ) : (
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
      )}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Back to Dashboard</button>
      </div>
    </div>
  );
};

export default InspectProfile;
