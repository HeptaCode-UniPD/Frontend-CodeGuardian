// src/pages/History.tsx
import { Link } from 'react-router-dom';

export default function History() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Repositories</h1>
      <p>Qui vedrai l'elenco dei repository. Per ora è vuoto, ma almeno funziona il routing!</p>
      
      <nav style={{ marginTop: '20px' }}>
        <Link to="/" style={{ color: '#007bff', fontSize: '1.2rem' }}>
          ← Torna alla Home
        </Link>
      </nav>
    </div>
  );
}