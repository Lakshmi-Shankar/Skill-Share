const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

const UserRoutes = require("./Routes/userRoutes");

app.use(express.json());
app.use("/user", UserRoutes);

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