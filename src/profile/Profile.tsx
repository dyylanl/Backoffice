import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './Profile.css';
import userPhoto from '../images/user_photo.webp';
import { UserContext } from '../UserContext';
import { API_BASE_URL } from '../config';


function Profile() {
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const now = new Date();
  let hora = now.getHours().toString();
  let minuto = now.getMinutes().toString();
  if (parseInt(minuto) < 10) {
    minuto = '0' + minuto;
  }
  const curr = hora + ':' + minuto;
  const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')!) : {};
  const userName = userData.name;
  const user_footer = {
    name: userName || 'Usuario no identificado',
    loginTime: curr,
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        const id = userData.id;
        if (!id) {
          throw new Error('No se pudo obtener el ID del usuario.');
        }
        const res = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            throw new Error('La sesión ha expirado. Por favor, inicia sesión nuevamente.');
          }
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const responseData = await res.json();

        if (!responseData.data || !responseData.data.id) {
          throw new Error('El perfil recibido no contiene un ID válido.');
        }

        setProfile(responseData.data);
      } catch (e: any) {
        setError(e.message);
        if (e.message.includes('sesión ha expirado')) {
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) {
    return null;
  }

  const handleEditProfile = () => {
    navigate(`/editUser/${profile.id}`);
  };

  return (
    <div className="profile-container">
      <main className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <img
              src={profile['profile-photo'] || userPhoto}
              alt="Foto de perfil"
              className="profile-photo"
            />
            <h1 className="profile-name">{profile.name || profile.username}</h1>
          </div>
          <div className="profile-details">
            <h2>Detalles del Usuario</h2>
            <ul>
              <li><strong>Nombre:</strong> {profile.name}</li>
              <li><strong>Email:</strong> {profile.email}</li>
              <li><strong>Ubicación:</strong> {profile.location || '—'}</li>
              <li><strong>Rol:</strong> {profile.admin ? 'Administrador' : 'Usuario'}</li>
              <li><strong>Bloqueado:</strong> {profile['blocked-user'] ? 'Sí' : 'No'}</li>
              <li><strong>Descripción:</strong> {profile.description || '—'}</li>
            </ul>
          </div>
          <div className="profile-actions">
            <button className="profile-button" onClick={handleEditProfile}>
              Editar Perfil
            </button>
            <button className="profile-button">Cambiar Contraseña</button>
          </div>
        </div>
      </main>
      <Footer user={user_footer} />
    </div>
  );
}

export default Profile;