import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket.js";
import PostCard from "../components/PostCard";
import Chat from "../components/Chat";
import "./Feed.css";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const BASE = "http://localhost:5000/uploads/";

function Feed() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [friends, setFriends] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  // Chat — ícone na navbar abre painel de amigos para escolher
  const [chatFriend, setChatFriend] = useState(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const chatPanelRef = useRef(null);

  // Pedidos de amizade
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const requestsRef = useRef(null);

  // Pesquisa
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleOutsideClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (requestsRef.current && !requestsRef.current.contains(e.target)) setShowRequests(false);
      if (chatPanelRef.current && !chatPanelRef.current.contains(e.target)) setShowChatPanel(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!currentUser || !localStorage.getItem("token")) { navigate("/"); return; }

    loadPosts();
    loadFriends();
    loadReceivedRequests();

    socket.connect();
    socket.emit("userOnline", { userId: currentUser.id });
    socket.on("onlineUsers", (ids) => setOnlineUserIds(ids.map(Number)));

    return () => { socket.off("onlineUsers"); socket.disconnect(); };
  }, []);

  async function loadPosts() {
    try {
      const res = await api.get("/posts/feed");
      setPosts(res.data);
    } catch (err) { console.error(err); }
  }

  async function loadFriends() {
    try {
      const res = await api.get("/friends/list");
      const list = res.data.map((r) =>
        r.senderId === currentUser.id ? r.receiver : r.sender
      );
      setFriends(list);
    } catch (err) { console.error(err); }
  }

  async function loadReceivedRequests() {
    try {
      const res = await api.get("/friends/received");
      setReceivedRequests(res.data);
    } catch (err) { console.error(err); }
  }

  async function handleAccept(id) {
    await api.patch("/friends/accept/" + id);
    setReceivedRequests((p) => p.filter((r) => r.id !== id));
    loadFriends();
  }

  async function handleReject(id) {
    await api.patch("/friends/reject/" + id);
    setReceivedRequests((p) => p.filter((r) => r.id !== id));
  }

  async function handleSearch(e) {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); setShowSearch(false); return; }
    setShowSearch(true);
    try {
      const res = await api.get("/users/search?q=" + encodeURIComponent(q));
      setSearchResults(res.data);
    } catch {
      const filtered = friends.filter((f) =>
        f.name.toLowerCase().includes(q.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }

  async function handleAddFriend(userId) {
    try {
      await api.post("/friends/request", { receiverId: userId });
      alert("Pedido de amizade enviado!");
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      alert(err.response?.data?.message ?? "Erro ao enviar pedido");
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!content.trim() && !image) return;
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);
      await api.post("/posts", formData);
      setContent(""); setImage(null); setImagePreview(null);
      loadPosts();
    } catch (err) { console.error(err); }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function handleDeletePost(postId) {
    setPosts((p) => p.filter((post) => post.id !== postId));
  }

  function handleLogout() {
    localStorage.clear();
    socket.disconnect();
    navigate("/");
  }

  function openChat(friend) {
    setChatFriend(friend);
    setShowChatPanel(false);
  }

  const onlineFriends = friends.filter((f) => onlineUserIds.includes(f.id));

  return (
    <div className="feed-page">

      {/* ===== NAVBAR ===== */}
      <header className="navbar">
        <h1 className="logo">Social Network</h1>

        {/* PESQUISA */}
        <div className="search-wrap" ref={searchRef}>
          <input
            type="text"
            placeholder="Pesquisar pessoas..."
            className="search"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchQuery && setShowSearch(true)}
          />
          {showSearch && (
            <div className="search-dropdown">
              {searchResults.length === 0
                ? <p className="dropdown-empty">Nenhum resultado</p>
                : searchResults.map((u) => (
                  <div className="search-result" key={u.id}>
                    <img src={u.avatar ? BASE + u.avatar : DEFAULT_AVATAR} alt="" />
                    <span onClick={() => { navigate("/profile/" + u.id); setShowSearch(false); }}>
                      {u.name}
                    </span>
                    <button className="btn-add-friend" onClick={() => handleAddFriend(u.id)}>
                      + Adicionar
                    </button>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* ÍCONES NAVBAR */}
        <div className="nav-icons">

          {/* INÍCIO */}
          <span onClick={() => navigate("/feed")} title="Início" className="nav-btn">🏠</span>

          {/* CHAT — abre painel com lista de amigos */}
          <span className="nav-btn notif-wrap" ref={chatPanelRef}>
            <span onClick={() => { setShowChatPanel((s) => !s); setShowRequests(false); }} title="Mensagens">
              💬
              {onlineFriends.length > 0 && (
                <span className="badge green">{onlineFriends.length}</span>
              )}
            </span>

            {showChatPanel && (
              <div className="nav-dropdown chat-panel">
                <h4>Mensagens</h4>
                {friends.length === 0
                  ? <p className="dropdown-empty">Ainda não tens amigos.</p>
                  : friends.map((f) => (
                    <div className="chat-panel-user" key={f.id} onClick={() => openChat(f)}>
                      <div className="cp-avatar-wrap">
                        <img src={f.avatar ? BASE + f.avatar : DEFAULT_AVATAR} alt="" />
                        {onlineUserIds.includes(f.id) && <span className="cp-dot"></span>}
                      </div>
                      <div className="cp-info">
                        <span>{f.name}</span>
                        <small>{onlineUserIds.includes(f.id) ? "Online" : "Offline"}</small>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </span>

          {/* PEDIDOS DE AMIZADE */}
          <span className="nav-btn notif-wrap" ref={requestsRef}>
            <span onClick={() => { setShowRequests((s) => !s); setShowChatPanel(false); }} title="Pedidos de amizade">
              👥
              {receivedRequests.length > 0 && (
                <span className="badge red">{receivedRequests.length}</span>
              )}
            </span>

            {showRequests && (
              <div className="nav-dropdown">
                <h4>Pedidos de amizade</h4>
                {receivedRequests.length === 0
                  ? <p className="dropdown-empty">Sem pedidos pendentes.</p>
                  : receivedRequests.map((r) => (
                    <div className="request-item" key={r.id}>
                      <img src={r.sender?.avatar ? BASE + r.sender.avatar : DEFAULT_AVATAR} alt="" />
                      <span
                        className="request-name"
                        onClick={() => { navigate("/profile/" + r.sender.id); setShowRequests(false); }}
                      >
                        {r.sender?.name}
                      </span>
                      <button className="btn-accept" onClick={() => handleAccept(r.id)}>✓</button>
                      <button className="btn-reject" onClick={() => handleReject(r.id)}>✕</button>
                    </div>
                  ))
                }
              </div>
            )}
          </span>

          {/* PERFIL */}
          <span onClick={() => navigate("/profile/" + currentUser.id)} title="Perfil" className="nav-btn">👤</span>

          {/* SAIR */}
          <span onClick={handleLogout} title="Sair" className="nav-btn">🚪</span>
        </div>
      </header>

      {/* ===== LAYOUT ===== */}
      <div className="feed-container">

        {/* SIDEBAR ESQUERDA */}
        <aside className="sidebar">
          <div className="profile-card" onClick={() => navigate("/profile/" + currentUser.id)}>
            <img src={currentUser?.avatar ? BASE + currentUser.avatar : DEFAULT_AVATAR} alt="" />
            <h3>{currentUser?.name}</h3>
          </div>
          <ul>
            <li onClick={() => navigate("/feed")}>🏠 Início</li>
            <li onClick={() => navigate("/profile/" + currentUser.id)}>👤 Perfil</li>
            <li onClick={() => { setShowChatPanel(true); window.scrollTo(0, 0); }}>💬 Mensagens</li>
          </ul>

          {friends.length > 0 && (
            <div className="sidebar-friends">
              <h4>Amigos ({friends.length})</h4>
              {friends.map((f) => (
                <div className="sidebar-friend" key={f.id} onClick={() => navigate("/profile/" + f.id)}>
                  <div className="friend-avatar-wrap">
                    <img src={f.avatar ? BASE + f.avatar : DEFAULT_AVATAR} alt="" />
                    {onlineUserIds.includes(f.id) && <span className="online-indicator"></span>}
                  </div>
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* FEED CENTRAL */}
        <main className="feed">
          <div className="create-post">
            <form onSubmit={handleCreatePost}>
              <div className="create-top">
                <img src={currentUser?.avatar ? BASE + currentUser.avatar : DEFAULT_AVATAR} alt="" className="create-avatar" />
                <textarea
                  placeholder={"O que estás a pensar, " + (currentUser?.name?.split(" ")[0] ?? "") + "?"}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              {imagePreview && (
                <div className="img-preview">
                  <img src={imagePreview} alt="" />
                  <button type="button" className="btn-remove-img" onClick={() => { setImage(null); setImagePreview(null); }}>✕</button>
                </div>
              )}
              <div className="create-footer">
                <label className="btn-photo">
                  📷 Foto
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </label>
                <button type="submit" className="btn-publish" disabled={!content.trim() && !image}>
                  Publicar
                </button>
              </div>
            </form>
          </div>

          {posts.length === 0 && (
            <div className="empty-feed">
              <p>📭 Sem posts para mostrar.</p>
              <small>Adiciona amigos para ver os posts deles aqui!</small>
            </div>
          )}

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onDelete={handleDeletePost}
            />
          ))}
        </main>

        {/* SIDEBAR DIREITA — ONLINE */}
        <aside className="online-sidebar">
          <h3>Online agora</h3>
          {onlineFriends.length === 0
            ? <p className="no-online">Nenhum amigo online</p>
            : onlineFriends.map((f) => (
              <div className="online-user" key={f.id} onClick={() => openChat(f)} title={"Chat com " + f.name}>
                <div className="online-avatar-wrap">
                  <img src={f.avatar ? BASE + f.avatar : DEFAULT_AVATAR} alt="" />
                  <span className="online-dot"></span>
                </div>
                <span>{f.name}</span>
                <span className="chat-icon">💬</span>
              </div>
            ))
          }
        </aside>
      </div>

      {chatFriend && <Chat friend={chatFriend} onClose={() => setChatFriend(null)} />}
    </div>
  );
}

export default Feed;