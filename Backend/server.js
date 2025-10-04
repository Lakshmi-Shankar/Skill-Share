const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"] }
});

app.set("io", io);

// Middleware
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());

// Routes
const UserRoutes = require("./Routes/userRoutes");
const SkillRoutes = require("./Routes/skillManagement");
const RequestRoutes = require("./Routes/requestRoutes");

app.use("/user", UserRoutes);
app.use("/skills", SkillRoutes);
app.use("/request", RequestRoutes);

// Socket.IO
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("joinUser", (userId) => {
    socket.join(userId); 
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

app.set("socketio", io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected!");
    server.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error(err.message));
