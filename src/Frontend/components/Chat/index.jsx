import { useEffect, useRef, useState } from "react";
import socket from "../../services/socket";
import "./Chat.css";

const BASE = "http://localhost:3000/uploads/";
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

function Chat({ friend, onClose }) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const roomId = [currentUser.id, friend.id].sort().join("-");

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit("joinRoom", { roomId });

    const handleMsg = (msg) => setMessages((p) => [...p, msg]);
    socket.on("message", handleMsg);

    return () => {
      socket.off("message", handleMsg);
      socket.emit("leaveRoom", { roomId });
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = {
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: text,
      createdAt: new Date().toISOString(),
    };
    socket.emit("sendMessage", msg);
    setMessages((p) => [...p, msg]);
    setText("");
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img src={friend.avatar ? BASE + friend.avatar : DEFAULT_AVATAR} alt="" />
        <strong>{friend.name}</strong>
        <button className="chat-close" onClick={onClose}>✕</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">Envia uma mensagem para começar!</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={"chat-msg " + (m.senderId === currentUser.id ? "mine" : "theirs")}>
            <p>{m.content}</p>
            <span>{new Date(m.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Escreve uma mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default Chat;
