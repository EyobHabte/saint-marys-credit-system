import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [currentRecipient, setCurrentRecipient] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/header/messages/');
        setMessages(response.data);
      } catch (err) {
        setError("Failed to fetch messages.");
        toast.error("Failed to fetch messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!currentRecipient || !newMessage.trim()) {
      toast.error("Please select a recipient and write a message.");
      return;
    }

    try {
      const response = await axios.post('/api/header/messages/send/', {
        recipient: currentRecipient,
        message: newMessage,
      });

      setMessages((prevMessages) => [response.data, ...prevMessages]);
      setNewMessage("");
      toast.success("Message sent successfully!");
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.post(`/api/header/messages/mark-read/`, { id });
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      toast.error("Failed to mark message as read.");
    }
  };

  return (
    <div className="messages-page">
      <h1>Messages</h1>
      <ToastContainer />
      <div className="new-message-container">
        <input
          type="text"
          placeholder="Recipient Username"
          value={currentRecipient}
          onChange={(e) => setCurrentRecipient(e.target.value)}
        />
        <textarea
          placeholder="Write your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        ></textarea>
        <button onClick={handleSendMessage}>Send</button>
      </div>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${message.read ? "read" : "unread"}`}
              onClick={() => !message.read && handleMarkAsRead(message.id)}
            >
              <p>
                <strong>From:</strong> {message.sender}
              </p>
              <p>{message.message}</p>
              <small>{new Date(message.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
