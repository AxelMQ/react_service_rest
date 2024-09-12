import React, { useState, useEffect } from 'react';
import '../UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const soapMessage = `
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                            xmlns:web="${process.env.REACT_APP_SOAP_NAMESPACE}">
            <soapenv:Header/>
            <soapenv:Body>
              <web:GetDatos/>
            </soapenv:Body>
          </soapenv:Envelope>
        `;

        // Función para agregar un timeout a la solicitud fetch
        const fetchWithTimeout = (url, options, timeout = 10000) => {
          return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timed out')), timeout)
            )
          ]);
        };

        // Realizar la solicitud con timeout
        const response = await fetchWithTimeout(`${process.env.REACT_APP_API_URL}/persons/get-datos-soap`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml',
            'SOAPAction': process.env.REACT_APP_SOAP_ACTION_GET_DATOS,
          },
          body: soapMessage,
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, "text/xml");
        const userNodes = xmlDoc.getElementsByTagName("User");

        if (userNodes.length === 0) {
          throw new Error('No se encontraron datos de usuario en la respuesta.');
        }
        const usersData = [];

        for (let i = 0; i < userNodes.length; i++) {
          const userNode = userNodes[i];
          const CI = userNode.getElementsByTagName("CI")[0]?.textContent || 'N/A';;
          const Nombre = userNode.getElementsByTagName("Nombre")[0]?.textContent || 'N/A';;
          const Apellido = userNode.getElementsByTagName("Apellido")[0]?.textContent || 'N/A';;
          const Sexo = userNode.getElementsByTagName("Sexo")[0]?.textContent || 'N/A';;

          usersData.push({
            ci: CI,
            nombre: Nombre,
            apellido: Apellido,
            sexo: Sexo,
          });
        }

        setUsers(usersData);
        setErrorMessage(''); 
      } catch (error) {
        console.error('Error fetching users:', error);
        setErrorMessage('No se pudo cargar la lista de usuarios. Por favor, revisa tu conexión a Internet o intenta de nuevo más tarde.');

      }
    };

    fetchUsers();
  }, []);


  return (
    <div className="user-list-container">
      <h2>Lista de Usuarios</h2>

      {errorMessage && (
        <div className="error-notification">
          <p>{errorMessage}</p>
        </div>
      )}


      <table className="user-table">
        <thead>
          <tr>
            <th>CI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Sexo</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.ci}</td>
              <td>{user.nombre}</td>
              <td>{user.apellido}</td>
              <td>{user.sexo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
