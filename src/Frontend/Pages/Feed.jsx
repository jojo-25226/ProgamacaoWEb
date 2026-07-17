import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PostCard from "../components/PostCard";
import "./Feed.css";
import NavBar from "../components/NavBar/index.jsx";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const BASE = "http://localhost:5000/uploads/";

function Feed() {
    const navigate = useNavigate();
    const [currentUser] = useState(() => JSON.parse(localStorage.getItem("user")));
    const [friends, setFriends] = useState([]);

    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [visibility, setVisibility] = useState("Public");

    useEffect(() => {
        // Impede o acesso ao feed sem sessão iniciada
        if (!currentUser || !localStorage.getItem("token")) {
            navigate("/");
            return;
        }

        // Carrega os amigos e posts
        loadPosts();
        loadFriends();
    }, []);

    // Vai buscar os posts visíveis para o utilizador
    async function loadPosts() {
        try {
            const res = await api.get("/posts/feed");
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        }
    }
    // Vai buscar os amigos para mostrar
    async function loadFriends() {
        try {
            const res = await api.get("/friends/list");
            const list = res.data.map((r) =>
                r.senderId === currentUser.id ? r.receiver : r.sender
            );
            setFriends(list);
        } catch (err) {
            console.error(err);
        }
    }

    // Envia um novo post
    async function handleCreatePost(e) {
        e.preventDefault();

        // Não deixa publicar posts sem mensagem
        if (!content.trim()) return;

        try {
            const formData = new FormData();
            formData.append("content", content);
            if (image) formData.append("image", image);
            formData.append("visibility", visibility);

            await api.post("/posts", formData);

            // Limpa o formulário
            setContent("");
            setImage(null);
            setImagePreview(null);
            setVisibility("Public");

            // Atualiza o feed
            loadPosts();
        } catch (err) {
            console.error(err);
        }
    }

    // Guarda a imagem escolhida e cria uma pré-visualização
    function handleImageChange(e) {
        const file = e.target.files[0];
        setImage(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    }

    // Remove o post apagado do estado
    function handleDeletePost(postId) {
        setPosts((p) => p.filter((post) => post.id !== postId));
    }

    return (
        <div className="feed-page">
            <NavBar />

            {/* ===== LAYOUT ===== */
            }
            <div className="feed-container">

                {/* SIDEBAR ESQUERDA */}
                <aside className="sidebar">
                    <div className="profile-card" onClick={() => navigate("/profile/" + currentUser.id)}>
                        <img src={currentUser?.avatar ? BASE + currentUser.avatar : DEFAULT_AVATAR} alt=""/>
                        <h3>{currentUser?.name}</h3>
                    </div>
                    <ul>
                        <li onClick={() => navigate("/feed")}>🏠 Início</li>
                        <li onClick={() => navigate("/profile/" + currentUser.id)}>👤 Perfil</li>
                    </ul>

                    {friends.length > 0 && (
                        <div className="sidebar-friends">
                            <h4>Amigos ({friends.length})</h4>
                            {friends.map((f) => (
                                <div className="sidebar-friend" key={f.id} onClick={() => navigate("/profile/" + f.id)}>
                                    <div className="friend-avatar-wrap">
                                        <img src={f.avatar ? BASE + f.avatar : DEFAULT_AVATAR} alt=""/>
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
                                <img src={currentUser?.avatar ? BASE + currentUser.avatar : DEFAULT_AVATAR} alt=""
                                     className="create-avatar"/>
                                <textarea
                                    placeholder={"O que estás a pensar, " + (currentUser?.name?.split(" ")[0] ?? "") + "?"}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                            {imagePreview && (
                                <div className="img-preview">
                                    <img src={imagePreview} alt=""/>
                                    <button type="button" className="btn-remove-img" onClick={() => {
                                        setImage(null);
                                        setImagePreview(null);
                                    }}>✕
                                    </button>
                                </div>
                            )}
                            <div className="create-footer">
                                <label className="btn-photo">
                                    📷 Foto
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{display: "none"}}
                                    />
                                </label>

                                <div className="publish-actions">
                                    <select
                                        className="privacy-select"
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value)}
                                    >
                                        <option value="Public">Público</option>
                                        <option value="Friends">Só amigos</option>
                                    </select>

                                    <button
                                        type="submit"
                                        className="btn-publish"
                                        /* Bloqueado se não houver mensagem */
                                        disabled={!content.trim()}
                                    >
                                        Publicar
                                    </button>
                                </div>
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
                    <p className="no-online">Nenhum amigo online</p>
                </aside>
            </div>
        </div>
    );
}

export default Feed;