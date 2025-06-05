import { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import './Rules.css';
import { useNavigate } from 'react-router-dom';

interface Rule {
  id: number;
  ApplicationCondition: string;
  Description: string;
  Title: string;
  effectiveDate: string;
}

function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ApplicationCondition: '',
    Description: '',
    Title: '',
    effectiveDate: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const authenticatedFetch = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      console.error('Sesión expirada o no autorizado. Redirigiendo al login...');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
      throw new Error('Unauthorized');
    }
    return response;
  };

  const fetchRules = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/rules`, { signal });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al obtener reglas');
      }
      const data = await res.json();

      setRules(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      if (err.name === 'AbortError') {
      } else if (err.message !== 'Unauthorized') {
        setError(err.message || 'Error al obtener reglas');
        console.error('Error fetching rules:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    fetchRules(signal);

    return () => {
      abortController.abort();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const effectiveDateRFC3339 = formData.effectiveDate
        ? `${formData.effectiveDate}T00:00:00Z`
        : '';

      const payload = {
        ApplicationCondition: formData.ApplicationCondition,
        Description: formData.Description,
        Title: formData.Title,
        effectiveDate: effectiveDateRFC3339,
        id: 0,
      };

      const res = await authenticatedFetch(`${API_BASE_URL}/rules`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al crear regla');
      }
      setFormData({ ApplicationCondition: '', Description: '', Title: '', effectiveDate: '' });
      setShowForm(false);
      fetchRules();
    } catch (err: any) {
      if (err.message !== 'Unauthorized') {
        alert(err.message || 'Error al crear regla');
        console.error('Error creating rule:', err);
      }
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditId(rule.id);
    setFormData({ 
      ApplicationCondition: rule.ApplicationCondition, 
      Description: rule.Description, 
      Title: rule.Title,
      effectiveDate: rule.effectiveDate 
    });
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) {
      alert('Error: ID de regla no especificado para la actualización.');
      return;
    }
    try {
      const payload = {
        ApplicationCondition: formData.ApplicationCondition,
        Description: formData.Description,
        Title: formData.Title,
      };

      const res = await authenticatedFetch(`${API_BASE_URL}/rules/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al modificar regla');
      }
      setEditId(null);
      setFormData({ ApplicationCondition: '', Description: '', Title: '', effectiveDate: '' });
      setShowForm(false);
      fetchRules();
    } catch (err: any) {
      if (err.message !== 'Unauthorized') {
        alert(err.message || 'Error al modificar regla');
        console.error('Error updating rule:', err);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta regla?')) return;
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/rules/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al eliminar regla');
      }
      fetchRules(); 
    } catch (err: any) {
      if (err.message !== 'Unauthorized') {
        alert(err.message || 'Error al eliminar regla');
        console.error('Error deleting rule:', err);
      }
    }
  };

  const filteredRules = rules.filter(
    (rule) =>
      rule.Title.toLowerCase().includes(search.toLowerCase()) || 
      rule.Description.toLowerCase().includes(search.toLowerCase()) ||
      rule.ApplicationCondition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rules-container">
      <div className="rules-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <span className="button-icon">&larr;</span>
          <span className="button-text">Volver al Dashboard</span>
        </button>
        <h1>Gestión de Reglas</h1>
      </div>
      <div className="rules-actions-bar">
        <input
          type="text"
          placeholder="Buscar regla por Título, Descripción o Condición..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rules-search"
        />
        <button className="dashboard-button" onClick={() => { setShowForm(true); setEditId(null); setFormData({ ApplicationCondition: '', Description: '', Title: '', effectiveDate: '' }); }}>
          + Nueva Regla
        </button>
      </div>
      {showForm && (
        <form className="rules-form" onSubmit={editId ? handleUpdate : handleCreate}>
          <input
            type="text"
            name="Title"
            placeholder="Título de la Regla"
            value={formData.Title}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="Description" 
            placeholder="Descripción"
            value={formData.Description}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="ApplicationCondition"
            placeholder="Condición de Aplicación"
            value={formData.ApplicationCondition}
            onChange={handleInputChange}
            required
          />
          {}
          <input
            type="date"
            name="effectiveDate"
            placeholder="Fecha Efectiva (YYYY-MM-DD)"
            value={formData.effectiveDate}
            onChange={handleInputChange}
            required={!editId} 
            disabled={!!editId && !formData.effectiveDate}
          />
          <div className="rules-form-actions">
            <button type="submit" className="dashboard-button">
              {editId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" className="dashboard-button cancel" onClick={() => { setShowForm(false); setEditId(null); setFormData({ ApplicationCondition: '', Description: '', Title: '', effectiveDate: '' }); }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="rules-loading">Cargando reglas...</div>
      ) : error ? (
        <div className="rules-error">{error}</div>
      ) : (
        <div className="rules-list">
          {filteredRules && filteredRules.length === 0 ? (
            <div className="no-results">No hay reglas registradas o no coinciden con la búsqueda.</div>
          ) : (
            filteredRules.map((rule) => (
              <div className="rule-card" key={rule.id}>
                <div>
                  <h3>{rule.Title}</h3> {}
                  <p><strong>Descripción:</strong> {rule.Description}</p>
                  <p><strong>Condición:</strong> {rule.ApplicationCondition}</p>
                  <p><strong>Fecha Efectiva:</strong> {rule.effectiveDate}</p>
                </div>
                <div className="rule-actions">
                  <button className="dashboard-button edit" onClick={() => handleEdit(rule)}>
                    Editar
                  </button>
                  <button className="dashboard-button delete" onClick={() => handleDelete(rule.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Rules;