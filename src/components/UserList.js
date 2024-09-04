import React, { useState, useEffect } from 'react';
import '../UserList.css'; // Asegúrate de importar el archivo CSS

function UserList() {
  const [users, setUsers] = useState([]);
  const [transaccionId, setTransaccionId] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);


  const handleVerify = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}//verificar?transaccion_id=${transaccionId}`);
      const data = await response.json();
      if (response.ok) {
        setVerificationResult(`Transacción encontrada: ${JSON.stringify(data.usuario)}`);
      } else {
        setVerificationResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setVerificationResult('Error al verificar la transacción');
    }
  };

  return (
    <div className="user-list-container">
      <h2>Lista de Usuarios</h2>

      <div className="verification-container">
        <input
          type="text"
          value={transaccionId}
          onChange={(e) => setTransaccionId(e.target.value)}
          placeholder="Ingrese el ID de Transacción"
        />
        <button onClick={handleVerify}>Verificar Transacción</button>
        {verificationResult && <p>{verificationResult}</p>}
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Dirección</th>
            <th>Fecha de Nacimiento</th>
            <th>Estado Civil</th>
            <th>ID de Transacción</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.apellido}</td>
              <td>{user.direccion}</td>
              <td>{user.fecha_nac}</td>
              <td>{user.estado_civil}</td>
              <td>{user.transaccion_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
