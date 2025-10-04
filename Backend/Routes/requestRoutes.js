const express = require("express");
const Request = require("../Schema/requestSchema");
const User = require("../Schema/userSchema");
const routes = express.Router();

// Send new request
routes.post("/request", async (req, res) => {
  try {
    const { fromUser, toUser, offerSkill, wantSkill } = req.body;

    if (!fromUser || !toUser || !offerSkill || !wantSkill) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newRequest = new Request({ fromUser, toUser, offerSkill, wantSkill });
    await newRequest.save();

    const populatedRequest = await newRequest.populate("fromUser", "userName");

    // ✅ Emit only to the receiver, NOT the sender
    const io = req.app.get("socketio");
    io.to(toUser).emit("newRequest", populatedRequest);

    return res.status(201).json({ message: "Request sent!", request: populatedRequest });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Get all requests for a user
routes.get("/requests/:userId", async (req, res) => {
  try {
    const requests = await Request.find({ toUser: req.params.userId })
      .populate("fromUser", "userName");

    return res.status(200).json({ requests });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

// Update request status
routes.patch("/request/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("fromUser toUser");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // ✅ Always use "socketio" (consistent with server.js)
    const io = req.app.get("socketio");

    if (status === "DECLINED") {
      io.to(request.fromUser._id.toString()).emit("requestDeclined", {
        requestId: request._id,
        message: `❌ Your request for ${request.wantSkill} in exchange for ${request.offerSkill} was declined by ${request.toUser.userName}.`,
      });
    }

    if (status === "ACCEPTED") {
      io.to(request.fromUser._id.toString()).emit("requestAccepted", {
        requestId: request._id,
        message: `✅ Your request for ${request.wantSkill} in exchange for ${request.offerSkill} was accepted by ${request.toUser.userName}.`,
      });
    }

    return res.status(200).json({
      message: "Request updated",
      request,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

module.exports = routes;
