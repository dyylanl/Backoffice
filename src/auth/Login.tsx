import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './Login.css';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../config';



interface DecodedToken {
  sub: number;
  exp: number;
}

interface ApiResponse {
  data: UserData;
}

interface UserData {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  location: string;
  role: string;
  "blocked-user": boolean;
  "profile-photo": number;
  description: string;
}

export default function Login() {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const fetchUserData = async (userId: number, token: string): Promise<UserData> => {
    try {
      console.log("Fetching user data for userId:", userId);
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error('Error al obtener datos del usuario');
      }

      const responseData: ApiResponse = await res.json();
      return responseData.data;
    } catch (err) {
      console.error('Error fetching user data:', err);
      throw err;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      setLoading(false);
      return;
    }

    console.log("Fetching..........");
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (loginResponse.status == 400) {
        setError('La contraseña debe contener al menos 8 caracteres.');
        setLoading(false);
        return;
      }

      if (loginResponse.status === 401) {
        setError('Credenciales incorrectas');
        setLoading(false);
        return;
      }

      console.log("Resp---------->", loginResponse);
      if (loginResponse.status === 404) {
        setError('No hay respuesta del servidor\nComuniquese con un administrador de sistemas.');
        setLoading(false);
        return;
      }

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw new Error(errorText || 'Error en la autenticación');
      }

      const { token } = await loginResponse.json();

      if (!token) {
        throw new Error('No se recibió un token válido');
      }

      const decodedToken = jwtDecode<DecodedToken>(token);
      
      
      console.log("Decoded token:", decodedToken);


      const userId = decodedToken.sub;

      if (!userId) {
        throw new Error('El token no contiene un ID de usuario válido');
      }

      const userData = await fetchUserData(userId, token);

      console.log("User data received:", userData);

      if (!userData) {
        throw new Error('No se recibieron datos del usuario');
      }

      if (userData["blocked-user"]) {
        throw new Error('Tu cuenta está bloqueada. Contacta al administrador.');
      }

      if (userData.role != "admin") {
        throw new Error('Solo los administradores pueden acceder a esta plataforma');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        surname: userData.surname,
        role: userData.role,
        isBlocked: userData["blocked-user"],
        profilePhoto: userData["profile-photo"],
        location: userData.location,
        description: userData.description,
      }));
      setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        surname: userData.surname,
        isBlocked: userData["blocked-user"],
        profilePhoto: userData["profile-photo"],
        location: userData.location,
        description: userData.description,
        role: userData.role,
      });

      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message || 'Error durante el proceso de login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1>Iniciar sesión</h1>
        <p className="admin-notice">* Solo para administradores *</p>
        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading ? (
            <>
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>

        {/* <p className="register-link">
          ¿No tienes una cuenta? <Link to="/createUser">Registra un nuevo administrador</Link>
        </p> */}
      </form>
    </div>
  );
}