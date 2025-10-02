import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Search, Bell, Cat, Dog, Bird, Smile, Rocket } from "lucide-react";
import { io } from "socket.io-client";
import "../styles/Interface.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [jingle, setJingle] = useState(false);

  const currentId = localStorage.getItem("userId");
  const notificationRef = useRef();

  const avatarIcons = [User, Cat, Dog, Bird, Smile, Rocket];

  // Socket.io setup
  useEffect(() => {
    const socket = io("http://localhost:5000");

    // Join current user room
    socket.emit("joinUser", currentId);

    // Listen for new requests
    socket.on("newRequest", (request) => {
      // Only add if the logged-in user is the receiver
      if (request.toUser === currentId && request.status === "PENDING") {
        setNotifications((prev) => [...prev, request]);

        setJingle(true);
        etTimeout(() => setJingle(false), 1000);
      }
    });    

    return () => socket.disconnect();
  }, [currentId]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/user/dashboard");
        const data = await res.json();
        if (res.ok) setUsers(data.users);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch notifications for current user
// Fetch notifications for current user
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/request/requests/${currentId}`);
      const data = await res.json();
      if (res.ok) {
        // Only show requests that are still PENDING
        const pendingRequests = data.requests.filter(r => r.status === "PENDING");
        setNotifications(pendingRequests);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  fetchNotifications();
}, [currentId]);


  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u._id !== currentId &&
      (u.skills.length === 0 || u.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())))
  );

  // Accept or decline request
  const handleRequest = async (reqId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/request/request/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((r) => r._id !== reqId));
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="nav-left">
          <h2>Dashboard</h2>
        </div>
        <div className="nav-center">
          <p>Welcome to your workspace</p>
        </div>

        {/* Notifications */}
        <div className="nav-right" ref={notificationRef}>
          <button onClick={() => navigate("/profile")} className="profile-btn">
            My Profile
          </button>

          <Bell
            size={24}
            className={`dashboard-bell ${jingle ? "jingle" : ""}`}
            onClick={() => setShowNotifications((prev) => !prev)}
          />

          {/* Notification Panel */}
          {showNotifications && notifications.length > 0 && (
            <div className="notification-panel">
              <h3>Requests</h3>
              {notifications.map((req) => (
                <div key={req._id} className="notification-card">
                  {req.fromUser ? (
                    <>
                      <p>
                        <strong>{req.fromUser.userName}</strong> wants <strong>{req.wantSkill}</strong> in exchange for <strong>{req.offerSkill}</strong>
                      </p>
                      <div className="notification-actions">
                        <button onClick={() => handleRequest(req._id, "ACCEPTED")}>Accept</button>
                        <button onClick={() => handleRequest(req._id, "DECLINED")}>Decline</button>
                      </div>
                    </>
                  ) : (
                    <p>Loading request...</p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Search below workspace */}
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search by skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="users-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const RandomAvatar = avatarIcons[Math.floor(Math.random() * avatarIcons.length)];
              return (
                <div
                  key={user._id}
                  className="user-card"
                  onClick={() => navigate(`/inspect/${user._id}`)}
                >
                  <RandomAvatar />
                  <p>{user.userName}</p>
                  <p>
                    {user.skills.length > 0
                      ? user.skills
                          .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
                          .join(", ")
                      : "None"}
                  </p>
                </div>
              );
            })
          ) : (
            <p>No users found with that skill.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
