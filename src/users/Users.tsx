import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Users.css';
import { API_BASE_URL } from '../config';

interface UserData {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  location?: string;
  role: string;
  blocked: boolean;
  profile_photo?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  verified?: boolean;
  phone?: string;
}

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticatedFetch = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.error('Sesión expirada o no autorizado. Redirigiendo al login...');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
      throw new Error('Unauthorized');
    }

    return response;
  };


  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/users`, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error al obtener los usuarios');
        }

        const data = await response.json();
        setUsers(data.data);
        setFilteredUsers(data.data);
      } catch (err: any) {
        if (err.message !== 'Unauthorized') { 
            setError(err.message || 'Ocurrió un error al obtener los usuarios');
            console.error('Error fetching users:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [navigate]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.location?.toLowerCase().includes(term) ||
        user.surname?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term)  
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {

      const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',

      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar el usuario');
      }

      setUsers(users.filter((user) => user.id !== id));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
    } catch (err: any) {
      if (err.message !== 'Unauthorized') { 
        console.error('Error al eliminar usuario:', err);
        alert(err.message || 'Ocurrió un error al eliminar el usuario');
      }
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/editUser/${id}`);
  };


  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="dashboard-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            <span className="button-icon">&larr;</span>
            <span className="button-text">Volver al Dashboard</span>
          </button>
          <h1>Gestión de Usuarios</h1>
          <p className="users-count">{filteredUsers.length} usuarios encontrados</p>
        </div>

        <div className="users-header-actions">
          <button
            onClick={() => navigate('/createUser')}
            className="create-admin-button"
          >
            + Crear Admin
          </button>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o ubicación..."
              value={searchTerm}
              onChange={handleSearch}
              className="users-search"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="users-list-container">
        {filteredUsers.length > 0 ? (
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <div key={user.id} className={`user-card ${user.blocked ? 'blocked' : ''}`}>
                <div className="user-card-header">
                  <div className="user-avatar">
                    {user.profile_photo ? (
                      <img src={user.profile_photo} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0)}{user.surname?.charAt(0) || ''}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <h2>{user.name} {user.surname}</h2>
                    <p className="user-email">{user.email}</p>
                    {user.blocked && (
                      <span className="blocked-badge">BLOQUEADO</span>
                    )}
                  </div>
                </div>

                <div className="user-details">
                  {user.location && (
                    <p><span className="detail-label">Ubicación:</span> {user.location}</p>
                  )}
                  {user.phone && (
                    <p><span className="detail-label">Teléfono:</span> {user.phone}</p>
                  )}
                  {user.created_at && (
                    <p><span className="detail-label">Registrado:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="user-actions">
                  <button
                    onClick={() => handleEdit(user.id)}
                    className="action-button edit"
                  >
                    Editar
                  </button>

                  {/* {user.blocked ? (
                    <button
                      onClick={() => handleUnblock(user.id)}
                      className="action-button unblock"
                    >
                      Desbloquear
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlock(user.id)}
                      className="action-button block"
                    >
                      Bloquear
                    </button>
                  )} */}

                  <button
                    onClick={() => handleDelete(user.id)}
                    className="action-button delete"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No se encontraron usuarios que coincidan con la búsqueda</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilteredUsers(users);
              }}
              className="dashboard-button"
            >
              Mostrar todos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;