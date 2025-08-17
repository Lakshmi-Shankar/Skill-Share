import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from "lucide-react";
import "../styles/Interface.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [load, setLoad] = useState(true);

  const [currentId, setCurrentId] = useState(null);
  const [currentName, setCurrentName] = useState(null);

  const GetUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/user/dashboard", {
        method: "GET",
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
        setLoad(false);
        setCurrentId(localStorage.getItem("userId"));
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    setCurrentId(localStorage.getItem("userId"));
    setCurrentName(localStorage.getItem("userName"));
    GetUsers();
  }, []);

return (
  <div className="dashboard-container">
    <div className="dashboard-header">
      <div className="nav-left">
        <h2>Dashboard</h2>
      </div>
      <div className="nav-center">
        <p>Welcome to your workspace</p>
      </div>
      <div className="nav-right">
        <button onClick={() => navigate("/profile")}>My Profile <User height={15}/></button>
      </div>
    </div>

    {load ? (
      <div>Loading....</div>
    ) : (
      <div className="users-list">
        {users
          .filter(user => user._id !== currentId) // Exclude current user
          .map((data, index) => (
            <div className="user-card" key={index}>
            <p>{data.userName}</p>
            <p>{data.skills.length > 0 ? data.skills.join(", ") : "None"}</p>
      </div>
  ))}
</div>
    )}
  </div>
);
};

export default Dashboard;
