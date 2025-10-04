const express = require("express");
const router = express.Router();
const Chat = require("../Schema/chatModel");

// Create or get chat
router.post("/create", async (req, res) => {
  const { userA, userB } = req.body;
  try {
    let chat = await Chat.findOne({ participants: { $all: [userA, userB] } });
    if (!chat) {
      chat = new Chat({ participants: [userA, userB], messages: [] });
      await chat.save();
    }
    res.status(200).json({ chat });
  } catch (err) {
    res.status(500).json({ message: "Error creating chat", error: err.message });
  }
});

// Get chat by id
router.get("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate("participants", "userName");
    res.status(200).json({ chat });
  } catch (err) {
    res.status(500).json({ message: "Error fetching chat", error: err.message });
  }
});

// Add message
router.post("/:chatId/message", async (req, res) => {
  const { sender, text } = req.body;
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ sender, text });
    await chat.save();

    const io = req.app.get("socketio");
    chat.participants.forEach((userId) => {
      io.to(userId.toString()).emit("newMessage", { chatId: chat._id, sender, text });
    });

    res.status(200).json({ message: "Message sent", chat });
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
});

module.exports = router;
