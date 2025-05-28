import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './Dashboard.css';


function Dashboard() {

    const navigate = useNavigate();
    const now = new Date();
    let hora = now.getHours().toString();
    let minuto = now.getMinutes().toString();
    if (parseInt(minuto)<10) {
      minuto = '0'+minuto;
    }
    const curr = hora + ':' + minuto;
    const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')!) : {};
    const userName = userData.name;
    const user = {
      name: userName || 'Usuario no identificado',
      loginTime: curr,
    };

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <h1>Bienvenido a Class Connect System</h1>
          <p>
            Este sistema te permitirá gestionar los cursos y usuarios del sistema. 
            Explora las funcionalidades disponibles para optimizar tu tiempo y mejorar la organización.
          </p>
        </div>
        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Gestionar metricas</h2>
            <p>Chequea las metricas de la plataforma para mantener todo bajo control.</p>
            <button
              className="dashboard-button"
              onClick={() => navigate('/metrics')} 
            >
                Ir a Metricas
                </button>
          </div>
          <div className="dashboard-section">
            <h2>Gestionar usuarios</h2>
            <p>Consulta la lista de usuarios y edita su información.</p>
            <button
              className="dashboard-button"
              onClick={() => navigate('/users')} 
            >
              Ir a usuarios
            </button>
          </div>          
        </div>
      </main>
      <Footer user={user} />
    </div>
  );
}

export default Dashboard;