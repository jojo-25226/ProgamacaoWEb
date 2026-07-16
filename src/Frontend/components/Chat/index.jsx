import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import "./Chat.css";

const BASE = "http://localhost:5000/uploads/";
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

function Chat({ friend, onClose }) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Carrega o histórico sempre que este chat é aberto.
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await api.get("/messages/" + friend.id);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadMessages();
  }, [friend.id]);

  // Mantém a mensagem mais recente visível.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();

    const content = text.trim();
    if (!content) return;

    try {
      const res = await api.post("/messages", {
        receiverId: friend.id,
        content,
      });

      setMessages((current) => [...current, res.data]);
      setText("");
    } catch (err) {
      alert(err.response?.data?.message ?? "Não foi possível enviar a mensagem");
    }
  }

  return (
      <div className="chat-window">
        <div className="chat-header">
          <img src={friend.avatar ? BASE + friend.avatar : DEFAULT_AVATAR} alt="" />
          <strong>{friend.name}</strong>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
              <p className="chat-empty">Envia uma mensagem para começar!</p>
          )}

          {messages.map((message) => (
              <div
                  key={message.id}
                  className={
                      "chat-msg " +
                      (message.senderId === currentUser.id ? "mine" : "theirs")
                  }
              >
                <p>{message.content}</p>
                <span>
              {new Date(message.createdAt).toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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