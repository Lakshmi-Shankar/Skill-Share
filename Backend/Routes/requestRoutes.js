const express = require("express");
const Request = require("../Schema/requestSchema");
const User = require("../Schema/userSchema");
const router = express.Router();

// Send new request
router.post("/request", async (req, res) => {
  try {
    const { fromUser, toUser, offerSkill, wantSkill } = req.body;
    if (!fromUser || !toUser || !offerSkill || !wantSkill) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newRequest = new Request({ fromUser, toUser, offerSkill, wantSkill });
    await newRequest.save();
    const populatedRequest = await newRequest.populate("fromUser", "userName");

    const io = req.app.get("socketio");
    io.to(toUser).emit("newRequest", populatedRequest);

    return res.status(201).json({ message: "Request sent!", request: populatedRequest });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Get requests for a user
router.get("/requests/:userId", async (req, res) => {
  try {
    const requests = await Request.find({ toUser: req.params.userId })
      .populate("fromUser", "userName");
    return res.status(200).json({ requests });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Update request status
router.patch("/request/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("fromUser toUser");

    if (!request) return res.status(404).json({ message: "Request not found" });

    const io = req.app.get("socketio");

    if (status === "DECLINED") {
      io.to(request.fromUser._id.toString()).emit("requestDeclined", {
        requestId: request._id,
        message: `❌ Your request for ${request.wantSkill} in exchange for ${request.offerSkill} was declined by ${request.toUser.userName}.`,
      });
    }

    if (status === "ACCEPTED") {
        // Notify the sender
        io.to(request.fromUser._id.toString()).emit("requestAccepted", {
            message: `✅ Your request for ${request.wantSkill} in exchange for ${request.offerSkill} was accepted by ${request.toUser.userName}.`,
            fromUserId: request.toUser._id
        });

        // Notify the receiver that chat is now available
        io.to(request.toUser._id.toString()).emit("requestAcceptedForReceiver", {
            fromUserId: request.fromUser._id
        });
    }



    return res.status(200).json({ message: "Request updated", request });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Check if accepted request exists between two users (either direction)
router.get("/status/:userA/:userB", async (req, res) => {
  try {
    const { userA, userB } = req.params;
    const request = await Request.findOne({
      status: "ACCEPTED",
      $or: [
        { fromUser: userA, toUser: userB },
        { fromUser: userB, toUser: userA },
      ],
    });
    res.status(200).json({ request });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


module.exports = router;
