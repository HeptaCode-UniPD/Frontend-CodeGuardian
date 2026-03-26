import { useState } from 'react';
import {checkEmailValid, checkCredentials, getIDbyEmail} from '../services/UserService';
import { saveUserID, isLogged} from '../services/SessionService';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
    isLogged();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailValid, setEmailValid] = useState(true);
    const [isCredentialCorrect, setCredentialCorrect] = useState(true);
    const key = 'userID';
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prevState) => !prevState);
    };
 
const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    if(isEmailValid){
        const result_valid = await checkEmailValid(email);
        setEmailValid(result_valid);
        if(result_valid){
            const result_credential = await checkCredentials(email, password);
            setCredentialCorrect(result_credential);
            
            if(result_credential){
                saveUserID(key, await getIDbyEmail(email));
                setLoading(false);
                navigate('/repositories');
                return
            }
        }
    }
    setLoading(false);
};

const handleAnnulla = async () => {
    setEmail('');
    setPassword('');
    return
};

  return (
    <article id="login-page">
        <div id="login-image"></div>
        <h1>Accedi</h1>
        <form onSubmit={handleLogin} onReset={handleAnnulla}>
            <legend aria-hidden="true">Accedi</legend>
            <div>
                <label htmlFor="email-input">Email: </label>
                <input id="email-input" name="email" value={email} onChange={(e) => {setEmail(e.target.value); setCredentialCorrect(true); setEmailValid(true);}} placeholder="Email" className={!isEmailValid ? 'error' : ''}/>
            </div>
            <div>
                <label htmlFor="password-input">Password: </label>
                <input id="password-input" name="password" type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(e) => {setPassword(e.target.value); setCredentialCorrect(true); setEmailValid(true);}}/>
                <button type="button" onClick={togglePasswordVisibility} id="password-icon" aria-label={isPasswordVisible ? 'Nascondi password' : 'Mostra password'}>
                    {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            
            <div>
                <button type="reset" id="reset-button" disabled={loading}> Annulla </button>
                <button type="submit" id="login" disabled={loading || !isEmailValid || !email || !password}> Accedi </button>
            </div>
            {!isCredentialCorrect && !loading && email && password && isEmailValid &&  <p className="error"> Le credenziali non sono corrette.</p>}
            {!isEmailValid &&email && <p id="email-not-valid"> L'email è in un formato non valido.</p>}
            {loading && email && password && <p id="loading"> Verifica informazioni...</p>}
        </form>
    </article>
  );
}
