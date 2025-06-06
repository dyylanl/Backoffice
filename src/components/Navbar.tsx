import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-menu">
        {/* Sección izquierda */}
        <ul className="left-section">
          <li><Link to="/dashboard">Inicio</Link></li>
          <li><Link to="/metrics">Métricas</Link></li>
          <li><Link to="/users">Usuarios</Link></li>
          <li><Link to="/rules">Reglas</Link></li>
        </ul>

        {/* Sección derecha */}
        <div className="right-section">
          <Link to="/profile" className="dashboard-menu-button" title="Perfil">
            <FontAwesomeIcon icon={faUser} className="logout-icon" />
          </Link>
          <button onClick={handleLogout} className="logout">
            <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;