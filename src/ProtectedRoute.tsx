import { JSX, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';

interface ProtectedRouteProps {
  children: JSX.Element;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (!user && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [user, setUser]);

  const storedUser = localStorage.getItem('userData');
  if (!user && !storedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;