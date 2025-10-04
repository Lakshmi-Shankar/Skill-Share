import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { ArrowLeft, Smile, Send } from "lucide-react"; // Lucide icons
import Picker from "emoji-picker-react"; // Emoji picker
import "../styles/ChatPage.css";

const ChatPage = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const currentId = localStorage.getItem("userId");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Initialize socket
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    newSocket.emit("joinUser", currentId);
    return () => newSocket.disconnect();
  }, [currentId]);

  // Fetch chat and listen for messages
  useEffect(() => {
    if (!socket) return;

    const fetchChat = async () => {
      const res = await fetch(`http://localhost:5000/chat/${chatId}`);
      const data = await res.json();
      if (res.ok) setChat(data.chat);
    };
    fetchChat();

    socket.on("newMessage", (msg) => {
      if (msg.chatId === chatId) {
        setChat((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), { sender: msg.sender, text: msg.text }],
        }));
      }
    });

    return () => socket.off("newMessage");
  }, [chatId, socket]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await fetch(`http://localhost:5000/chat/${chatId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: currentId, text: newMessage }),
    });

    setNewMessage("");
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  if (!chat) return <p>Loading chat...</p>;

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} style={{ marginRight: "5px" }} />
          Back
        </button>
        <h2>Chat Room</h2>
      </div>

      <div className="chat-messages">
        {chat.messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === currentId ? "own" : "other"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input-wrapper">
        {showEmojiPicker && (
          <div className="emoji-picker">
            <Picker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <div className="chat-input">
          <button
            className="emoji-button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile size={20} />
          </button>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="send-button" onClick={sendMessage}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
