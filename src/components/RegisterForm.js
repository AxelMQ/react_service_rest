import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../RegisterForm.css';
import InputField from './InputField';
import SelectField from './SelectField';
import Button from './Button';
import ErrorModal from './ErrorModal';
import './RegisterForm.css';

function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ci, setCi] = useState('');
  const [sexo, setSexo] = useState('');
  const [message, setMessage] = useState('');
  const [transaccionId, setTransaccionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const offlineRequests = useRef([]); // Usar useRef para persistir entre renderizados
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`API URL: ${process.env.REACT_APP_API_URL}`);
    
    const handleOnline = () => {
      setIsOffline(false);
      retryOfflineRequests(); // Intentar reenviar las solicitudes fallidas
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryOfflineRequests = () => {
    console.log('Reintentando solicitudes...');
    while (offlineRequests.current.length > 0) {
      const request = offlineRequests.current.shift();
      request();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setShowErrorModal(false);

    const userData = {
      ci,
      nombre,
      apellido,
      sexo
    };

    try {
      const response = await fetchWithTimeout(`${process.env.REACT_APP_API_URL}/persons/rest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }, 
      10000, // Timeout en milisegundos (10 segundos).
      3      // Número de intentos (3 en este caso).
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      if (errorResponse.errorType === 'DatabaseError') {
        throw new Error('Error en la base de datos: ' + errorResponse.message);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    }

      const result = await response.json();
      setMessage(result.message || 'Registro exitoso');
      setTransaccionId(result.transaccionId || '');
      setShowErrorModal(false);

    } catch (error) {
      if (!navigator.onLine) {
        offlineRequests.current.push(() => handleSubmit(event)); // Almacenar la solicitud para reenviar cuando vuelva la conexión
        setMessage('No tienes conexión a internet. La solicitud se reenviará cuando se recupere.');
      } else if (error.message === 'Failed to fetch') {
        setMessage('Parece que no podemos conectar con el servidor en este momento. Verifica tu conexión o inténtalo de nuevo más tarde.');
      } else if (error.message === 'Request timed out') {
        setMessage('La solicitud está tomando más tiempo de lo esperado. Por favor, espera un momento mientras reintentamos.');
      } else {
        setMessage(`Error: ${error.message}`);
      }
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCiChange = (e) => {
    const value = e.target.value;
  
    if (/^\d*$/.test(value)) {
      setCi(value);
      setMessage('');
  
      if (value.length < 6 || value.length > 12) {
        setMessage("El CI debe tener entre 6 y 12 dígitos.");
      } else {
        setMessage('');
      }
    } else {
      setMessage("El CI debe contener solo números.");
    }
  };
  

  const validateForm = () => {
    if (!/^\d+$/.test(ci)) {
      setMessage("El CI debe ser un número.");
      return false;
    }
    if (ci.length < 6 || ci.length > 12) {
      setMessage("El CI debe tener entre 6 y 12 dígitos.");
      return false;
    }
    setMessage('');
    return true;
  };

  const fetchWithTimeout = async (url, options, timeout = 10000, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
  
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
  
      } catch (error) {
        clearTimeout(timeoutId);
  
        if (error.name === 'AbortError' || error.message === 'Failed to fetch') {
          if (attempt === retries) {
            throw new Error(' - No pudimos conectar con el servidor después de varios intentos. Por favor, inténtalo de nuevo más tarde.');
          }          
          console.log(`Intento ${attempt} fallido, reintentando...`);
        } else {
          throw error;
        }
      }
    }
  };

  return (
    <div className="register-form-container">
      <h2>Formulario de Registro</h2>
      <Button 
        label="Ver Todos los Usuarios" 
        onClick={() => navigate('/users')} 
        styleType="secondary" 
      />

      {isOffline && (
        <div className="offline-indicator">
          <p>Estás sin conexión. Las solicitudes se reenviarán cuando vuelva la conexión.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {message && <p>{message}</p>}
        <InputField
          label="CI:"
          name="ci"
          value={ci}
          onChange={handleCiChange} 
          placeholder="Cédula de Identidad"
          required
        />
        <InputField
          label="Nombre:"
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          required
        />
        <InputField
          label="Apellido:"
          name="apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          placeholder="Apellido"
          required
        />
        <SelectField
          label="Sexo:"
          name="sexo"
          value={sexo}
          onChange={(e) => setSexo(e.target.value)}
          options={[
            { value: '', label: 'Seleccione su sexo' },
            { value: 'Masculino', label: 'Masculino' },
            { value: 'Femenino', label: 'Femenino' },
            { value: 'Otro', label: 'Otro' },
          ]}
          required
        />
        <Button 
          type="submit" 
          label={isSubmitting ? "Registrando..." : "Registrar"} 
          styleType="primary" 
          disabled={isSubmitting}
        />
      </form>
      
      {transaccionId && <p>ID de Transacción: {transaccionId}</p>}
    
      <ErrorModal 
        show={showErrorModal} 
        message={message} 
        onHide={() => setShowErrorModal(false)} 
      />
    </div>
  );
}

export default RegisterForm;
