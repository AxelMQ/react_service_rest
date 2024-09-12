import React, { useState, useEffect } from 'react';
import '../UserList.css';
import LoadingModal from './LoadingModal';
import ErrorModal from './ErrorModal';

function UserList() {
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para indicar carga
  const maxRetries = 5; // Máximo número de intentos

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const soapMessage = `
  //         <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  //                           xmlns:web="${process.env.REACT_APP_SOAP_NAMESPACE}">
  //           <soapenv:Header/>
  //           <soapenv:Body>
  //             <web:GetDatos/>
  //           </soapenv:Body>
  //         </soapenv:Envelope>
  //       `;

  //       // Función para agregar un timeout a la solicitud fetch
  //       const fetchWithTimeout = (url, options, timeout = 10000) => {
  //         return Promise.race([
  //           fetch(url, options),
  //           new Promise((_, reject) =>
  //             setTimeout(() => reject(new Error('Request timed out')), timeout)
  //           )
  //         ]);
  //       };

  //       // Realizar la solicitud con timeout
  //       const response = await fetchWithTimeout(`${process.env.REACT_APP_API_URL}/persons/get-datos-soap`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'text/xml',
  //           'SOAPAction': process.env.REACT_APP_SOAP_ACTION_GET_DATOS,
  //         },
  //         body: soapMessage,
  //       });

  //       if (!response.ok) {
  //         throw new Error(`Error: ${response.status} ${response.statusText}`);
  //       }

  //       const responseText = await response.text();
  //       const parser = new DOMParser();
  //       const xmlDoc = parser.parseFromString(responseText, "text/xml");
  //       const userNodes = xmlDoc.getElementsByTagName("User");

  //       if (userNodes.length === 0) {
  //         throw new Error('No se encontraron datos de usuario en la respuesta.');
  //       }
  //       const usersData = [];

  //       for (let i = 0; i < userNodes.length; i++) {
  //         const userNode = userNodes[i];
  //         const CI = userNode.getElementsByTagName("CI")[0]?.textContent || 'N/A';;
  //         const Nombre = userNode.getElementsByTagName("Nombre")[0]?.textContent || 'N/A';;
  //         const Apellido = userNode.getElementsByTagName("Apellido")[0]?.textContent || 'N/A';;
  //         const Sexo = userNode.getElementsByTagName("Sexo")[0]?.textContent || 'N/A';;

  //         usersData.push({
  //           ci: CI,
  //           nombre: Nombre,
  //           apellido: Apellido,
  //           sexo: Sexo,
  //         });
  //       }

  //       setUsers(usersData);
  //       setErrorMessage(''); 
  //     } catch (error) {
  //       console.error('Error fetching users:', error);
  //       setErrorMessage('No se pudo cargar la lista de usuarios. Por favor, revisa tu conexión a Internet o intenta de nuevo más tarde.');

  //     }
  //   };

  //   fetchUsers();
  // }, []);

  useEffect(() => {
    const fetchUsers = async (retryCount = 0) => {
      setIsLoading(true); // Inicia la carga

      try {
        // Función para agregar un timeout a la solicitud fetch
        const fetchWithTimeout = (url, options, timeout = 10000) => {
          return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timed out')), timeout)
            )
          ]);
        };

        // Realizar la solicitud GET a la API REST
        const response = await fetchWithTimeout(`${process.env.REACT_APP_API_URL}/persons`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Manejo de diferentes códigos de error del servidor
          if (response.status >= 500) {
            throw new Error('Error en el servidor. Por favor, intenta más tarde.');
          } else if (response.status >= 400) {
            throw new Error('Error en la solicitud. Verifica los datos e intenta de nuevo.');
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        }

        // Parsear la respuesta JSON
        const usersData = await response.json();

        if (usersData.length === 0) {
          throw new Error('No se encontraron datos de usuario.');
        }

        // Actualizar el estado con los datos de los usuarios
        setUsers(usersData);
        setErrorMessage(''); 

      } catch (error) {
        console.error('Error fetching users:', error);

        // Manejar el caso de un timeout o error de red
        if (error.message === 'Request timed out') {
          setErrorMessage('La solicitud ha tardado demasiado. Revisa tu conexión a Internet.');
        } else if (error.message.includes('NetworkError')) {
          setErrorMessage('No se pudo conectar al servidor. Revisa tu conexión de red.');
        } else {
          // Otros errores
          setErrorMessage(error.message);
        }

        // Lógica de reintento
        if (retryCount < maxRetries) {
          console.log(`Reintentando... (${retryCount + 1}/${maxRetries})`);
          fetchUsers(retryCount + 1); // Llama de nuevo a la función con un intento adicional
        } else {
          setErrorMessage('No se pudo cargar la lista de usuarios después de varios intentos. Revisa tu conexión o inténtalo más tarde.');
        }
      } finally {
        setIsLoading(false); // Termina la carga
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="user-list-container">
    <h2>Lista de Usuarios</h2>

    <LoadingModal
      show={isLoading}
      message="Cargando usuarios, por favor espera..."
    />

    <ErrorModal 
      show={!!errorMessage} 
      message={errorMessage} 
      onHide={() => setErrorMessage('')} 
    />

      {!isLoading && !errorMessage && (
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
      )}
    </div>
  );
}

export default UserList;
