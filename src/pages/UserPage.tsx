import { useEffect, useState } from 'react';
import {getInfoUserByID} from '../services/UserService';
import { type User} from '../data/types';
import { logout, getUserID, useIsLogged} from '../services/SessionService';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export default function UserPage() {
    useIsLogged();
    const navigate = useNavigate();
    const key = 'userID';
    const id = (getUserID(key));
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const openLogoutDialog = () => {
        dialogRef.current?.showModal();
    };

    const confirmLogout = () => {
        dialogRef.current?.close();
        handleLogout();
    };
    
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await getInfoUserByID(id);
                setUser(result??null);
            } catch (error) {
                console.error("Errore nel recupero profilo:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                <button type="button" onClick={openLogoutDialog} id="logout"> Esci </button>
            </div>
        </article>
        <dialog ref={dialogRef}>
            <p>Sei sicuro di voler uscire?</p>
            <div>
                <button onClick={confirmLogout}>Conferma</button>
                <button onClick={() => dialogRef.current?.close()}>Annulla</button>
            </div>
        </dialog>
    </div>
  );
}
