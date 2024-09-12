import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../RegisterForm.css';
import InputField from './InputField';
import SelectField from './SelectField';
import Button from './Button';
import './RegisterForm.css';

function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ci, setCi] = useState('');
  const [sexo, setSexo] = useState('');
  const [message, setMessage] = useState('');
  const [transaccionId, setTransaccionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const navigate = useNavigate();

  useEffect(() => {
    console.log(`API URL: ${process.env.REACT_APP_API_URL}`);
    // setMessage(`API URL: ${process.env.REACT_APP_API_URL}`)
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const soapRequest = buildSoapRequest(ci, nombre, apellido, sexo);
    console.log(soapRequest);
    try {
      const response = await fetchWithTimeout(`${process.env.REACT_APP_API_URL}/persons/soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          // 'SOAPAction': process.env.REACT_APP_SOAP_ACTION_REGISTER_USER,
        },
        body: soapRequest,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const text = await response.text();
      console.log('Response Text:', text);
      const { message } = parseSoapResponse(text);
      
      setMessage(message);
      console.log('Response Text:', text);
      console.log('Parsed Response:', { message });

      setMessage(message || 'Solicitud procesada');
      console.log('Parsed Response:', { message });

    } catch (error) {
      if (error.message === 'Failed to fetch') {
        setMessage('Error: No se pudo conectar con el servidor. Verifica tu conexión.');
      } else if (error.message === 'Tiempo de espera agotado') {
        setMessage('Error: Tiempo de espera agotado al conectar con el servidor.');
      } else {
        setMessage(error.message);
      } 
    } finally {
      setIsSubmitting(false); 
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

  const fetchWithTimeout = (url, options, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
  
    return fetch(url, { ...options, signal: controller.signal })
      .then(response => {
        clearTimeout(timeoutId);
        return response;
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado');
        }
        throw error;
      });
  };
  

  const parseSoapResponse = (responseText) => {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(responseText, 'text/xml');
    var messageElement = xmlDoc.getElementsByTagNameNS('http://example.com/', 'message')[0]?.textContent;
  
    var message = messageElement ? messageElement : 'No se recibió mensaje';
    return { message };
  };
  

  const escapeXml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const buildSoapRequest = (ci, nombre, apellido, sexo) => {
    const escapedCi = escapeXml(ci);
    const escapedNombre = escapeXml(nombre);
    const escapedApellido = escapeXml(apellido);
    const escapedSexo = escapeXml(sexo);
    const namespace = process.env.REACT_APP_SOAP_NAMESPACE;


    return `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ex="http://example.com/">
        <soapenv:Header/>
        <soapenv:Body>
            <ex:AddUserRequest>
                <ex:ci>${escapedCi}</ex:ci>
                <ex:nombre>${escapedNombre}</ex:nombre>
                <ex:apellido>${escapedApellido}</ex:apellido>
                <ex:sexo>${escapedSexo}</ex:sexo>
            </ex:AddUserRequest>
        </soapenv:Body>
    </soapenv:Envelope>`;
};
  return (
    <div className="register-form-container">
      <h2>Formulario de Registro</h2>
      <Button 
        label="Ver Todos los Usuarios" 
        onClick={() => navigate('/users')} 
        styleType="secondary" 
      />
      <form onSubmit={handleSubmit}>
        {message && <p>{message}</p>}
        <InputField
          label="CI:"
          name="ci"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
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
    </div>
  );
}

export default RegisterForm;
