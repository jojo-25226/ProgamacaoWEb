import "./Navbar.css";

function Navbar() {

  return (

    <div className="navbar">

      <h2 className="logo">
        Social Network
      </h2>

      <input
        type="text"
        placeholder="Pesquisar..."
        className="search"
      />

      <div className="nav-icons">

        <span>🏠</span>

        <span>💬</span>

        <span>🔔</span>

        <span>👤</span>

      </div>

    </div>
  );
}

export default Navbar;