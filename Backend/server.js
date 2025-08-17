const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();

const UserRoutes = require("./Routes/userRoutes");
const SkillRoutes = require("./Routes/skillManagement");
const RequestRoutes = require("./Routes/requestRoutes");

const dev = ["http://localhost:5173",];
app.use(cors({
    origin: dev,
}))

app.use(express.json());
app.use("/user", UserRoutes);
app.use("/skills", SkillRoutes);
app.use("/request", RequestRoutes);

PORT = process.env.PORT;
MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then((response) => {
    console.log("Database connected!");
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    })
})
.catch((err) => {
    console.log("Failed to connect to database");
    console.error(err.message);
})