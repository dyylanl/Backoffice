import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Users.css';
import { API_BASE_URL } from '../config';

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los usuarios');
        }

        const data = await response.json();
        setUsers(data.data);
        setFilteredUsers(data.data);
      } catch (error) {
        setError('Ocurrió un error al obtener los usuarios');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.location?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }

      setUsers(users.filter((user) => user.id !== id));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Ocurrió un error al eliminar el usuario');
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/editUser/${id}`);
  };

  // Helper para armar el body del usuario para bloquear/desbloquear
  const buildUserBody = (user: any, blockedValue: boolean) => ({
    blocked: blockedValue,
    created_at: user.created_at || '',
    description: user.description || '',
    email: user.email,
    id: user.id,
    location: user.location || '',
    name: user.name,
    profile_photo: user.profile_photo || '',
    role: user.role || '',
    surname: user.surname || '',
    updated_at: user.updated_at || '',
    verified: true,
  });

  const handleBlock = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/block/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify(buildUserBody(user, true)),
      });

      if (!response.ok) {
        throw new Error('Error al bloquear el usuario');
      }

      // Actualizar estado del usuario
      const updatedUsers = users.map(u =>
        u.id === id ? { ...u, blocked: true } : u
      );

      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error al bloquear usuario:', error);
      alert('Ocurrió un error al bloquear el usuario');
    }
  };

  const handleUnblock = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/modify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildUserBody(user, false)),
      });
      console.log(response)
      if (!response.ok) {
        throw new Error('Error al desbloquear el usuario');
      }

      // Actualizar estado del usuario
      const updatedUsers = users.map(u =>
        u.id === id ? { ...u, blocked: false } : u
      );

      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error al desbloquear usuario:', error);
      alert('Ocurrió un error al desbloquear el usuario');
    }
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

                  {user.blocked ? (
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
                  )}

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