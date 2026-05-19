import './Header.css';
import { Link } from 'react-router-dom';


export function Header() {
  return (
    <header className="header">
      <div className="header-content">

        {/* Logo */}
        <Link className="logo" to="/">Social NetWork</Link>

        {/* Barra de pesquisa */}
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Pesquisar..." 
          />
        </div>

        {/* Ícones e links */}
        <nav className="nav-links">

          

          {/* Link Amigos */}
          <Link className="amigos" to="/amigos">
            Meus Amigos
          </Link>
        </nav>

      </div>
    </header>
  );
}

export default Header;

