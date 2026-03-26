import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { getInfoUserByID } from './UserService';

export const saveUserID = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const getUserID = (key: string) => {
  return localStorage.getItem(key);
};

export const logout = (key: string) => {
  localStorage.removeItem(key);
}

export function isLogged() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserID('userID');

  useEffect(() => {
    const verifyUser = async () => {
      if (!userId) {
        if (location.pathname !== '/login') {
          navigate('/login');
        }
        return;
      }

      const currentUID: string = userId;

      if (location.pathname === '/login') {
        navigate('/repositories');
        return;
      }

      const user = await getInfoUserByID(currentUID);
      if (!user && location.pathname !== '/profile') {
        navigate('/profile');
        return;
      }
    };

    verifyUser();
  }, [userId, location.pathname, navigate]);
}