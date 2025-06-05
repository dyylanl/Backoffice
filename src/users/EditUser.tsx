import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditUser.css';
import { API_BASE_URL } from '../config';

interface UserData {
  id: number;
  admin?: boolean;
  blocked: boolean;
  created_at: string;
  description: string;
  email: string;
  location: string;
  name: string;
  phone: string;
  profile_photo: string;
  surname: string;
  updated_at: string;
  role?: string;
  username?: string;
}

function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserData>({
    id: 0,
    admin: false,
    blocked: false,
    created_at: '',
    description: '',
    email: '',
    location: '',
    name: '',
    phone: '',
    profile_photo: '',
    surname: '',
    updated_at: '',
    role: '', 
    username: '',
  });
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
    const fetchUser = async () => {
      if (!id) {
        setError('ID de usuario no proporcionado.');
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error al obtener los datos del usuario');
        }

        const result = await response.json();
        const data: UserData = result.data ? result.data : result;

        setFormData({
          id: data.id, 
          admin: data.role === 'admin' || data.admin, 
          blocked: data.blocked ?? false,
          created_at: data.created_at || '',
          description: data.description || '',
          email: data.email || '',
          location: data.location || '',
          name: data.name || '',
          phone: data.phone || '',
          profile_photo: data.profile_photo || '',
          surname: data.surname || '',
          updated_at: data.updated_at || '',
          role: data.role || '', 
          username: data.username || '',
        });
      } catch (err: any) {
        if (err.message !== 'Unauthorized') {
          setError(err.message || 'Ocurrió un error al cargar los datos del usuario');
          console.error('Error fetching user data:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
      ...(name === 'admin' && { role: checked ? 'admin' : 'user' }) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Enviar solo los campos a modificar, sin el id como clave
      const dataToSend = {
        description: formData.description,
        location: formData.location,
        name: formData.name,
        profile_photo: formData.profile_photo,
        surname: formData.surname,
        // agrega aquí otros campos si el backend los acepta
      };

      const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al modificar el usuario');
      }

      alert('Usuario modificado exitosamente');
      navigate('/users');
    } catch (err: any) {
      if (err.message !== 'Unauthorized') {
        console.error('Error al modificar usuario:', err);
        alert(err.message || 'Ocurrió un error al modificar el usuario');
      }
    }
  };

  if (loading) {
    return (
      <div className="edit-user-loading">
        <div className="loading-spinner"></div>
        <p>Cargando datos del usuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-user-error">
        <p>{error}</p>
        <button onClick={() => navigate('/users')} className="dashboard-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="edit-user-container">
      <div className="edit-user-header">
        <button onClick={() => navigate('/users')} className="back-button">
          <span className="button-icon">&larr;</span>
          <span className="button-text">Volver a Usuarios</span>
        </button>
        <h1>Editar Usuario</h1>
        <div className="user-info-summary">
          <div className="user-avatar">
            {formData.profile_photo ? (
              <img src={formData.profile_photo} alt={`${formData.name} ${formData.surname}`} />
            ) : (
              <div className="avatar-placeholder">
                {formData.name.charAt(0)}{formData.surname.charAt(0)}
              </div>
            )}
          </div>
          <div className="user-details">
            <h2>{formData.name} {formData.surname}</h2>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Estado:</strong> {formData.blocked ? 'Bloqueado' : 'Activo'}</p>
          </div>
        </div>
      </div>

      <div className="edit-user-content">
        <form className="edit-user-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Información Básica</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="surname">Apellido</label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Información Adicional</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="location">Ubicación</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile_photo">Foto de Perfil (URL)</label>
                <input
                  type="text"
                  id="profile_photo"
                  name="profile_photo"
                  value={formData.profile_photo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Configuración de Cuenta</h3>
            <div className="form-grid">
              <div className="form-group checkbox-group">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="admin"
                    name="admin"
                    checked={formData.admin}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="admin">Administrador</label>
                </div>
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="blocked"
                    name="blocked"
                    checked={formData.blocked}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="blocked">Usuario Bloqueado</label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Fechas</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="created_at">Creado el</label>
                <input
                  type="text"
                  id="created_at"
                  name="created_at"
                  value={formData.created_at}
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="updated_at">Actualizado el</label>
                <input
                  type="text"
                  id="updated_at"
                  name="updated_at"
                  value={formData.updated_at}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="dashboard-button">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUser;