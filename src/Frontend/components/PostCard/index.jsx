import { useState } from "react";
import api from "../../services/api";
import "./PostCard.css";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const BASE = "http://localhost:5000/uploads/";

function PostCard({ post, currentUserId, onDelete }) {
  const author = post.author ?? post.user;

  // BUG FIX: estado local de like — NÃO chama loadPosts após like,
  // isso causava o like a desaparecer porque o servidor devolvia dados antigos
  const [liked, setLiked] = useState(
    post.likedByUser ?? post.likes?.some((l) => l.userId === currentUserId) ?? false
  );
  const [likesCount, setLikesCount] = useState(
    post.likesCount ?? post.likes?.length ?? 0
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments ?? []);
  const [commentText, setCommentText] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);

  async function handleLike() {
    if (likeLoading) return;
    setLikeLoading(true);

    // Atualiza UI imediatamente (optimistic)
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      const res = await api.post("/posts/" + post.id + "/like");
      // Usa o valor real do servidor
      setLiked(res.data.liked);
      if (res.data.likesCount !== undefined) setLikesCount(res.data.likesCount);
    } catch {
      // Reverte em caso de erro
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post("/comments/" + post.id, { content: commentText });
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleComments() {
    const willShow = !showComments;
    setShowComments(willShow);

    if (!willShow) return;

    try {
      const res = await api.get("/comments/" + post.id);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleShare() {
    const url = window.location.origin + "/feed";
    navigator.clipboard?.writeText(url).then(() => alert("Link copiado!")).catch(() => alert("Não foi possível copiar."));
  }

  async function handleDelete() {
    if (!window.confirm("Tens a certeza que queres apagar este post?")) return;
    try {
      await api.delete("/posts/" + post.id);
      onDelete && onDelete(post.id);
    } catch (err) {
      alert(err.response?.data?.message ?? "Erro ao apagar post");
    }
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          className="post-avatar"
          src={author?.avatar ? BASE + author.avatar : DEFAULT_AVATAR}
          alt=""
        />
        <div className="post-meta">
          <h4>{author?.name}</h4>
          <span>{new Date(post.createdAt).toLocaleString("pt-PT")}</span>
        </div>
        {author?.id === currentUserId && (
          <button className="btn-delete-post" onClick={handleDelete} title="Apagar">🗑</button>
        )}
      </div>

      {post.content && <p className="post-content">{post.content}</p>}

      {(post.image || post.imageUrl) && (
        <img className="post-image" src={post.imageUrl ?? BASE + post.image} alt="" />
      )}

      <div className="post-stats">
        <span>{likesCount > 0 ? `👍 ${likesCount}` : ""}</span>
        <span
          className="stat-link"
          onClick={toggleComments}
        >
          {comments.length > 0 ? `${comments.length} comentário${comments.length !== 1 ? "s" : ""}` : ""}
        </span>
      </div>

      <div className="post-actions">
        <button
          className={"action-btn" + (liked ? " active" : "")}
          onClick={handleLike}
          disabled={likeLoading}
        >
          👍 {liked ? "Gostei" : "Gosto"}
        </button>
        <button className="action-btn" onClick={toggleComments}>
          💬 Comentar
        </button>
        <button className="action-btn" onClick={handleShare}>
          ↗ Partilhar
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form className="comment-form" onSubmit={handleComment}>
            <input
              type="text"
              placeholder="Escreve um comentário..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit">Enviar</button>
          </form>
          <div className="comments-list">
            {comments.length === 0 && (
              <p className="no-comments">Sem comentários ainda.</p>
            )}
            {comments.map((c) => (
              <div className="comment" key={c.id}>
                <img
                  className="comment-avatar"
                  src={c.user?.avatar ? BASE + c.user.avatar : DEFAULT_AVATAR}
                  alt=""
                />
                <div className="comment-bubble">
                  <strong>{c.user?.name}</strong>
                  <p>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;