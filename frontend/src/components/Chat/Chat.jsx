import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, User as UserIcon, ShieldQuestion } from 'lucide-react';
import './Chat.css';

const Chat = ({ itemId, receiverId, ownerId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate anonymous name from ID
  const getAnonymousName = (id) => {
    if (!id) return 'User_???';
    const lastThree = id.substring(id.length - 3);
    return `User_${lastThree}`;
  };

  const roomId = [currentUserId, receiverId].sort().join('-') + `-${itemId}`;

  useEffect(() => {
    const newSocket = io('http://localhost:5050');
    setSocket(newSocket);

    newSocket.emit('join_room', roomId);

    newSocket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Load message history from DB (Optional: Add API for this later)
    // For now, it resets on refresh

    return () => newSocket.close();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const msgData = {
        roomId,
        sender: currentUserId,
        receiver: receiverId,
        itemId,
        content: message,
        createdAt: new Date()
      };
      
      socket.emit('send_message', msgData);
      setMessage('');
    }
  };

  return (
    <div className="lf-chat-container">
      <div className="lf-chat-header">
        <ShieldQuestion size={18} />
        <span>Anonymous Verification Chat</span>
      </div>

      <div className="lf-chat-messages">
        <div className="lf-chat-notice">
          <p>Protect your identity! Ask verification questions before sharing personal info.</p>
        </div>
        
        {messages.map((msg, index) => (
          <div key={index} className={`lf-message ${msg.sender === currentUserId ? 'own' : 'other'}`}>
            <div className="lf-message-sender">
              {msg.sender === currentUserId ? 'You' : getAnonymousName(msg.sender)}
            </div>
            <div className="lf-message-content">
              {msg.content}
            </div>
            <div className="lf-message-time">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="lf-chat-input" onSubmit={sendMessage}>
        <input 
          type="text" 
          placeholder="Type a message or verification question..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={!message.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
