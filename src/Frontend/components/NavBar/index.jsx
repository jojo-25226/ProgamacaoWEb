import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../../services/api";
import Chat from "../Chat";
import "./NavBar.css";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const BASE = "http://localhost:5000/uploads/";

function NavBar() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [friends, setFriends] = useState([]);

    // Pesquisa
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);

    // Pedidos de amizade
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [showRequests, setShowRequests] = useState(false);
    const requestsRef = useRef(null);

    // Chat — ícone na navbar abre painel de amigos para escolher
    const [chatFriend, setChatFriend] = useState(null);
    const [showChatPanel, setShowChatPanel] = useState(false);
    const chatPanelRef = useRef(null);

    useEffect(() => {
        loadFriends();
        loadReceivedRequests();

        // Fecha os menus quando se clica fora deles
        function handleOutsideClick(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
            if (requestsRef.current && !requestsRef.current.contains(e.target)) setShowRequests(false);
            if (chatPanelRef.current && !chatPanelRef.current.contains(e.target)) setShowChatPanel(false);
        }

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    async function loadFriends() {
        try {
            const res = await api.get("/friends/list");

            const list = res.data.map((r) => r.senderId === currentUser?.id ? r.receiver : r.sender);

            setFriends(list);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadReceivedRequests() {
        try {
            const res = await api.get("/friends/received");
            setReceivedRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleAccept(requestId) {
        try {
            await api.patch("/friends/accept/" + requestId);

            setReceivedRequests((prev) => prev.filter((request) => request.id !== requestId));

            // A pessoa aceite passa a poder aparecer no chat.
            loadFriends();
        } catch (err) {
            console.error(err);
        }
    }

    async function handleReject(requestId) {
        try {
            await api.patch("/friends/reject/" + requestId);

            setReceivedRequests((prev) => prev.filter((request) => request.id !== requestId));
        } catch (err) {
            console.error(err);
        }
    }

    async function handleSearch(e) {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            setShowSearch(false);
            return;
        }

        setShowSearch(true);

        try {
            const res = await api.get("/users/search?q=" + encodeURIComponent(query));

            setSearchResults(res.data);
        } catch (err) {
            console.error(err);
            setSearchResults([]);
        }
    }

    async function handleAddFriend(userId) {
        try {
            await api.post("/friends/request", {receiverId: userId});

            alert("Pedido de amizade enviado!");
            setShowSearch(false);
            setSearchQuery("");
            setSearchResults([]);
        } catch (err) {
            alert(err.response?.data?.message ?? "Erro ao enviar pedido");
        }
    }

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function openChat(friend) {
        setChatFriend(friend);
        setShowChatPanel(false);
    }

    return (<>
        <header className="navbar">
            <h1
                className="logo"
                onClick={() => navigate("/feed")}
                style={{cursor: "pointer"}}
            >
                Social Network
            </h1>

            <div className="navbar-middle">
                <div className="search-wrap" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Pesquisar pessoas..."
                        className="search"
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => searchQuery && setShowSearch(true)}
                    />

                    {showSearch && (<div className="search-dropdown">
                        {searchResults.length === 0 ? (
                            <p className="dropdown-empty">Nenhum resultado</p>) : (searchResults.map((user) => (
                            <div className="search-result" key={user.id}>
                                <img
                                    src={user.avatar ? BASE + user.avatar : DEFAULT_AVATAR}
                                    alt=""
                                />

                                <span
                                    onClick={() => {
                                        navigate("/profile/" + user.id);
                                        setShowSearch(false);
                                    }}
                                >{user.name}</span>

                                <button
                                    className="btn-add-friend"
                                    onClick={() => handleAddFriend(user.id)}
                                >
                                    + Adicionar
                                </button>
                            </div>)))}
                    </div>)}
                </div>
            </div>

            <div className="nav-icons">
                    <span
                        onClick={() => navigate("/feed")}
                        title="Início"
                        className="nav-btn"
                    >🏠</span>

                <span className="nav-btn notif-wrap" ref={chatPanelRef}>
                        <span
                            onClick={() => {
                                setShowChatPanel((current) => !current);
                                setShowRequests(false);
                            }}
                            title="Mensagens"
                        >
                          💬
                        </span>

                    {showChatPanel && (<div className="nav-dropdown chat-panel">
                        <h4>Mensagens</h4>

                        {friends.length === 0 ? (<p className="dropdown-empty">Ainda não tens
                            amigos.</p>) : (friends.map((friend) => (<div
                            className="chat-panel-user"
                            key={friend.id}
                            onClick={() => openChat(friend)}
                        >
                            <div className="cp-avatar-wrap">
                                <img
                                    src={friend.avatar ? BASE + friend.avatar : DEFAULT_AVATAR}
                                    alt=""
                                />
                            </div>

                            <div className="cp-info">
                                <span>{friend.name}</span>
                            </div>
                        </div>)))}
                    </div>)}
                    </span>

                <span className="nav-btn notif-wrap" ref={requestsRef}>
                    <span
                        onClick={() => {
                            setShowRequests((current) => !current);
                            setShowChatPanel(false);
                        }}
                        title="Pedidos de amizade"
                    >👥
                        {receivedRequests.length > 0 && (<span className="badge red">
                          {receivedRequests.length}
                        </span>)}
                    </span>

                    {showRequests && (<div className="nav-dropdown">
                        <h4>Pedidos de amizade</h4>

                        {receivedRequests.length === 0 ? (<p className="dropdown-empty">Sem pedidos
                            pendentes.</p>) : (receivedRequests.map((request) => (
                            <div className="request-item" key={request.id}>
                                <img
                                    src={request.sender?.avatar ? BASE + request.sender.avatar : DEFAULT_AVATAR}
                                    alt=""
                                />

                                <span
                                    className="request-name"
                                    onClick={() => {
                                        navigate("/profile/" + request.sender.id);
                                        setShowRequests(false);
                                    }}
                                >{request.sender?.name}</span>

                                <button
                                    className="btn-accept"
                                    onClick={() => handleAccept(request.id)}
                                >✓
                                </button>

                                <button
                                    className="btn-reject"
                                    onClick={() => handleReject(request.id)}
                                >✕
                                </button>
                            </div>)))}
                    </div>)}
                </span>

                <span
                    onClick={() => navigate("/profile/" + currentUser?.id)}
                    title="Perfil"
                    className="nav-btn"
                >👤</span>

                <span
                    onClick={handleLogout}
                    title="Sair"
                    className="nav-btn"
                >🚪</span>
            </div>
        </header>

        {/* O chat é aberto por cima de qualquer página. */}
        {chatFriend && (<Chat
            friend={chatFriend}
            onClose={() => setChatFriend(null)}
        />)}
    </>);
}

export default NavBar;