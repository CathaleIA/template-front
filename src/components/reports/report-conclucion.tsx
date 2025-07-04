'use client'; // Solo si estás en App Router

import { useState } from 'react';

export const AgregarConclusion = () => {
  const [conclusion, setConclusion] = useState('');
  const [conclusiones, setConclusiones] = useState<string[]>([]);

  // Añadir al array local
  const handleAgregar = () => {
    if (!conclusion.trim()) return;
    setConclusiones([...conclusiones, conclusion.trim()]);
    setConclusion('');
  };

  // Eliminar una del array local
  const handleEliminar = (index: number) => {
    const nuevas = [...conclusiones];
    nuevas.splice(index, 1);
    setConclusiones(nuevas);
  };

  // Insertar todas en el HTML (DOM)
  const handleCargarEnHTML = () => {
    const ul = document.getElementById('finalConclusionsList');
    if (ul) {
      ul.innerHTML = ''; // Limpiar el ul primero
      conclusiones.forEach((con) => {
        const li = document.createElement('li');
        li.textContent = con;
        ul.appendChild(li);
      });
    } else {
      console.warn('No se encontró el ul con id finalConclusionsList');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <label htmlFor="conclusionTextarea">Agregar conclusión:</label>
      <textarea
        id="conclusionTextarea"
        value={conclusion}
        onChange={(e) => setConclusion(e.target.value)}
        placeholder="Escribe una conclusión..."
        rows={4}
        style={{
          width: '100%',
          padding: '10px',
          resize: 'vertical',
          marginBottom: '10px',
          fontSize: '16px',
        }}
      />
      <br />
      <button onClick={handleAgregar} style={{ marginBottom: '15px' }}>
        Agregar
      </button>

      <div style={{ marginTop: '10px' }}>
        <h3>Conclusiones a cargar:</h3>
        {conclusiones.length === 0 && <p>No hay conclusiones agregadas aún.</p>}
        <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
          {conclusiones.map((c, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>
              {c}{' '}
              <button
                onClick={() => handleEliminar(index)}
                style={{
                  marginLeft: '10px',
                  background: '#ff4d4d',
                  color: 'white',
                  border: 'none',
                  padding: '2px 6px',
                  cursor: 'pointer',
                }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {conclusiones.length > 0 && (
        <button
          onClick={handleCargarEnHTML}
          style={{
            marginTop: '20px',
            padding: '10px 15px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Cargar conclusiones al HTML
        </button>
      )}
    </div>
  );
};

AgregarConclusion;
