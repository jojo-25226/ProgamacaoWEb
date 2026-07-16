import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import PostCard from "../components/PostCard";
import "./Profile.css";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const BASE_URL = "http://localhost:5000/uploads/";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isMe = Number(id) === currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [friendStatus, setFriendStatus] = useState(null); // null | "pending" | "friends"
  const [friendshipId, setFriendshipId] = useState(null);
  const fileRef = useRef();

  async function loadProfile() {
    try {
      const res = await api.get("/users/" + id + "/profile");
      setProfile(res.data);
      setBio(res.data.bio ?? "");
    } catch (err) {
      console.error(err);

      alert(
          `Erro ao carregar perfil: ${
              err.response?.data?.message ?? err.message
          }`
      );
    }
  }

  async function checkFriendStatus() {
    if (isMe) return;
    try {
      const sent = await api.get("/friends/sent");
      const received = await api.get("/friends/received");
      const friends = await api.get("/friends/list");

      const friendship = friends.data.find(
        (r) => r.senderId === Number(id) || r.receiverId === Number(id)
      );
      if (friendship) {
        setFriendStatus("friends");
        setFriendshipId(friendship.id);
        return;
      }

      const isPending = sent.data.some((r) => r.receiverId === Number(id)) ||
        received.data.some((r) => r.senderId === Number(id));
      if (isPending) { setFriendStatus("pending"); return; }

      setFriendStatus(null);
      setFriendshipId(null);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    loadProfile();
    checkFriendStatus();
  }, [id]);

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.patch("/users/avatar", formData);
      const updated = { ...currentUser, avatar: res.data.avatar };
      localStorage.setItem("user", JSON.stringify(updated));
      loadProfile();
    } catch (err) { console.error(err); }
  }

  async function handleSaveBio() {
    try {
      await api.patch("/users/bio", { bio });
      setEditingBio(false);
      loadProfile();
    } catch (err) { console.error(err); }
  }

  async function handleAddFriend() {
    try {
      await api.post("/friends/request", { receiverId: Number(id) });
      setFriendStatus("pending");
    } catch (err) {
      alert(err.response?.data?.message ?? "Erro ao enviar pedido");
    }
  }

  async function handleRemoveFriend() {
    if (!friendshipId) return;
    if (!window.confirm("Queres remover esta amizade?")) return;

    try {
      await api.delete("/friends/" + friendshipId);
      setFriendStatus(null);
      setFriendshipId(null);
    } catch (err) {
      alert(err.response?.data?.message ?? "Nao foi possivel remover a amizade");
    }
  }

  if (!profile) return <div className="profile-loading">A carregar...</div>;

  return (
    <div className="profile-page">
      <header className="navbar">
        <h1 className="logo" onClick={() => navigate("/feed")} style={{ cursor: "pointer" }}>Social Network</h1>
        <div className="nav-icons">
          <span onClick={() => navigate("/feed")}>🏠</span>
          <span onClick={() => navigate("/profile/" + currentUser.id)}>👤</span>
        </div>
      </header>

      <div className="profile-container">
        <div className="profile-cover">
          <div className="profile-avatar-wrap">
            <img
              src={profile.avatar ? BASE_URL + profile.avatar : DEFAULT_AVATAR}
              alt=""
              className="profile-avatar-big"
            />
            {isMe && (
              <button className="change-avatar-btn" onClick={() => fileRef.current.click()}>📷</button>
            )}
            <input type="file" ref={fileRef} style={{ display: "none" }} accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-name-row">
            <h2>{profile.name}</h2>
            {!isMe && (
              <button
                className={"friend-btn " + (friendStatus ?? "")}
                onClick={friendStatus === "friends" ? handleRemoveFriend : friendStatus ? undefined : handleAddFriend}
                disabled={friendStatus === "pending"}
              >
                {friendStatus === "friends" ? "Remover amizade" : friendStatus === "pending" ? "Pedido enviado" : "+ Adicionar amigo"}
              </button>
            )}
          </div>

          <div className="profile-stats">
            <span><strong>{profile.postsCount ?? 0}</strong> posts</span>
          </div>

          <div className="profile-bio">
            {editingBio ? (
              <div className="bio-edit">
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Escreve a tua bio..." />
                <div className="bio-actions">
                  <button onClick={handleSaveBio} className="btn-save">Guardar</button>
                  <button onClick={() => setEditingBio(false)} className="btn-cancel">Cancelar</button>
                </div>
              </div>
            ) : (
              <p className="bio-text" onClick={isMe ? () => setEditingBio(true) : undefined} style={isMe ? { cursor: "pointer" } : {}}>
                {profile.bio || (isMe ? "Clica para adicionar uma bio..." : "")}
              </p>
            )}
          </div>
        </div>

        <div className="profile-posts">
          <h3>Posts</h3>
          {profile.posts?.length === 0 && <p className="no-posts">Ainda não há posts.</p>}
          <div className="posts-grid">
            {profile.posts?.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                onDelete={loadProfile}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
