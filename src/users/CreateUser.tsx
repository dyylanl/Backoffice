import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateUser.css';
import { API_BASE_URL } from '../config';

function CreateUser() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const {email, password, name, surname } = formData;


        const body = {
            email,
            name,
            password,
            surname,
            role: "admin", 
        };
        try {
            const response = await fetch(`${API_BASE_URL}/auth/admins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            alert('Usuario creado exitosamente');
            navigate('/users');
        } catch (error) {
            console.error('Error al crear usuario:', error);
            if (error instanceof Error) {
                try {
                    const errorData = JSON.parse(error.message.split(': ')[1]);
                    if (errorData.title == "Conflict") {
                        alert('El correo electrónico ya está en uso');
                    }
                    else if (errorData.title == "Bad Request") {
                        alert('La clave debe contener al menos 8 caracteres.');
                    }
                } catch {
                    alert('Error al procesar la respuesta del servidor');
                }
            } else {
                alert('Error desconocido');
            }
        }
    };

    return (
        <div className="create-user-container">
            <h1>Crear Nuevo Usuario</h1>
            <form className="create-user-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="surname">Apellido:</label>
                    <input
                        type="text"
                        id="surname"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Crear Usuario</button>
            </form>
        </div>
    );
}

export default CreateUser;
