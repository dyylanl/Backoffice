import { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import { useNavigate } from 'react-router-dom';
import './Rules.css';

interface NullableInt {
  Int64: number;
  Valid: boolean;
}

interface AuditRaw {
  Id: number;
  ModificationDate: string;
  NatureOfModification: string;
  RuleId: NullableInt;
  UserId: NullableInt;
}

interface Audit {
  Id: number;
  ModificationDate: string;
  NatureOfModification: string;
  RuleId: number | null;
  UserId: number | null;
}

function Logs() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}/rules/audit`, { headers });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Error al obtener logs');
        }
        const data = await res.json();
        // Adaptar los datos recibidos
        const rawAudits: AuditRaw[] = Array.isArray(data.data) ? data.data : [];
        const auditsAdapted: Audit[] = rawAudits.map(audit => ({
          Id: audit.Id,
          ModificationDate: audit.ModificationDate,
          NatureOfModification: audit.NatureOfModification,
          RuleId: audit.RuleId.Valid ? audit.RuleId.Int64 : null,
          UserId: audit.UserId.Valid ? audit.UserId.Int64 : null,
        }));
        setAudits(auditsAdapted);
      } catch (err: any) {
        setError(err.message || 'Error al obtener logs');
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  return (
    <div className="logs-container">
      <div className="rules-header">
        <button onClick={() => navigate('/rules')} className="back-button">
          <span className="button-icon">&larr;</span>
          <span className="button-text">Volver a Reglas</span>
        </button>
        <h1>Logs de Reglas</h1>
      </div>
      {loading ? (
        <div className="rules-loading">Cargando logs...</div>
      ) : error ? (
        <div className="rules-error">{error}</div>
      ) : (
        <div className="logs-list">
          {audits.length === 0 ? (
            <div className="no-results">No hay logs registrados.</div>
          ) : (
            audits.map((audit) => (
              <div className="log-card" key={audit.Id}>
                <p><strong>Fecha:</strong> {audit.ModificationDate}</p>
                <p><strong>Acción:</strong> {audit.NatureOfModification}</p>
                <p><strong>Regla ID:</strong> {audit.RuleId !== null ? audit.RuleId : 'N/A'}</p>
                <p><strong>Usuario ID:</strong> {audit.UserId !== null ? audit.UserId : 'N/A'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Logs;