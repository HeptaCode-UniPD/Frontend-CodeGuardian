import { useEffect, useState } from 'react';
import {getInfoUserByID} from '../services/UserService';
import { type User} from '../types/types';
import { logout, getUserID, useIsLogged} from '../services/SessionService';
import { useNavigate } from 'react-router-dom';

export default function UserPage() {
    useIsLogged();
    const navigate = useNavigate();
    const key = 'userID';
    const id = (getUserID(key));
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if(!id) return

        const fetchData = async () => {
            setLoading(true);
            const result = await getInfoUserByID(id);
            if (result) {setUser(result);}
            setLoading(false);};

        if (id) fetchData();
    }, [id]);

    const handleLogout = async () => {
    logout(key);
    navigate('/login');
    };

    if (loading) return <p>Caricamento...</p>;
    if (!user) return (
        <div id="profile-page">
            <p id="user-not-found">Utente non trovato.</p>
            <button type="button" onClick={handleLogout} id="logout">Esci</button>
        </div>
    );

  return (
    <div id="profile-page">
        <h1>Ciao {user?.nome} {user?.cognome}!</h1>
        <article>
            <div>
                <p id="avatar"></p>
            </div>
            <div>
                <dl>
                    <dt>Nome: </dt>
                    <dd>{user?.nome}</dd>
                    <dt>Cognome: </dt>
                    <dd>{user?.cognome}</dd>
                    <dt>Email: </dt>
                    <dd>{user?.email}</dd>
                </dl>
                <button type="button" onClick={handleLogout} id="logout">
                    Esci
                </button>
            </div>
        </article>
    </div>
  );
}
