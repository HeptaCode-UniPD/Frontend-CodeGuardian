// src/pages/Home.tsx
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Dashboard CodeGuardian</h1>
      <p>Questa è la tua home.</p>
      
      <nav style={{ marginTop: '20px' }}>
        <Link to="/history" style={{ color: '#007bff', fontSize: '1.2rem' }}>
          Vai ai repositories →
        </Link>
      </nav>
    </div>
  );
}