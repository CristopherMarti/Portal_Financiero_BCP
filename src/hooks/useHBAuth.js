import { useState } from 'react';

export const useHBAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token'); // Busca la llave estándar
  });

  const logout = () => {
    localStorage.clear(); // Limpia token, user_id y nombre
    setIsAuthenticated(false);
  };

  return { logout, isAuthenticated, setIsAuthenticated };
};