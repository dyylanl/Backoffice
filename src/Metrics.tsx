import './Metrics.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Metrics() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const metrics = [
    {
      title: "Rendimiento del Servidor",
      url: "https://us5.datadoghq.com/graph/embed?token=9d82292355cf15524ae006867c0696533b232e13a18bfd3fb915f842b9d83d7d&height=300&width=600&legend=true"
    },
    {
      title: "Uso de CPU",
      url: "https://us5.datadoghq.com/graph/embed?token=13498bccb94f69baedb04114a2106c249d4ddc6386640708ea180413543f53f7&height=300&width=600&legend=true"
    },
    {
      title: "Cantidad de registros",
      url: "https://us5.datadoghq.com/graph/embed?token=13be98468990b928ea2320abeed389b2d38a47321698e63e02c563d57a7823d1&height=300&width=600&legend=true"
    },
    {
      title: "Consumo de Memoria",
      url: "https://us5.datadoghq.com/graph/embed?token=c5ff9e0bd4ef39d4b91e5c334dae4585093de713dec50572c6ffc876b4065f7d&height=300&width=600&legend=true"
    },
    {
      title: "Cantidad de conexiones",
      url: "https://us5.datadoghq.com/graph/embed?token=b3c8e970dc1a2e57f5ceee105723ff2bcf2393a0cdf756ce216130b4a6f0c66f&height=300&width=600&legend=true"
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <button onClick={handleGoBack} className="back-button">
          <span className="button-icon">&larr;</span>
          <span className="button-text">Volver al Dashboard</span>
        </button>
        <h1 className="metrics-title">Métricas de la Plataforma</h1>
      </div>
      
      {isLoading ? (
        <div className="skeleton-grid">
          {[...Array(4)].map((_, idx) => (
            <div className="skeleton-card" key={idx}>
              <div className="skeleton-title"></div>
              <div className="skeleton-loader"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="metrics-grid">
          {metrics.map((metric, idx) => (
            <div className="metric-card" key={idx}>
              <h3 className="metric-title">{metric.title}</h3>
              <iframe
                src={metric.url}
                title={`${metric.title}`}
                width="100%"
                height="350px"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Metrics;