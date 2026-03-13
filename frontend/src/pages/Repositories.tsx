// src/pages/History.tsx
import { Link } from 'react-router-dom';

export default function History() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Repositories</h1>
      <p>Qui vedrai l'elenco dei repository. Per ora è vuoto, ma almeno funziona il routing!</p>
      
      <nav style={{ marginTop: '20px' }}>
        <div>
        <Link to="/repository/1" style={{ color: '#007bff', fontSize: '1.2rem' }}>
          Vai alla repo 1
        </Link>
        </div>
        <Link to="/repository/2" style={{ color: '#007bff', fontSize: '1.2rem' }}>
          Vai alla repo 2
        </Link>
      </nav>
    </div>
  );
}