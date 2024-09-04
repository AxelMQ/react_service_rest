import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../RegisterForm.css';

function RegisterForm() {
  const [nombre, setName] = useState('');
  const [apellido, setApellido] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fecha_nac, setFechaNac] = useState('');
  const [estado_civil, setEstadoCivil] = useState('');
  const [message, setMessage] = useState('');
  const [transaccionId, setTransaccionId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Verifica si la variable de entorno se carga correctamente
    console.log(`API URL: ${process.env.REACT_APP_API_URL}`);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, apellido, direccion, fecha_nac, estado_civil }),
      });

      const data = await response.json();
      setMessage(data.message);
      setTransaccionId(data.transaccion_id);
    } catch (error) {
      setMessage('Error al registrar el usuario');
    }
  };

  return (
    <div className="register-form-container">
      <h2>Formulario de Registro</h2>
      <button onClick={() => navigate('/users')}>Ver Todos los Usuarios</button>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            required
          />
        </div>
        <div>
          <label>Apellido:</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Apellido"
            required
          />
        </div>
        <div>
          <label>Dirección:</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Dirección"
            required
          />
        </div>
        <div>
          <label>Fecha de Nacimiento:</label>
          <input
            type="date"
            value={fecha_nac}
            onChange={(e) => setFechaNac(e.target.value)}
            placeholder="Fecha de Nacimiento"
            required
          />
        </div>
        <div>
          <label>Estado Civil:</label>
          <input
            type="text"
            value={estado_civil}
            onChange={(e) => setEstadoCivil(e.target.value)}
            placeholder="Estado Civil"
          />
        </div>
        <button type="submit">Registrar</button>
      </form>
      {message && <p>{message}</p>}
      {transaccionId && <p>ID de Transacción: {transaccionId}</p>}
    </div>
  );
}

export default RegisterForm;
