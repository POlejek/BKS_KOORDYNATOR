import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/** Chroni trasy – wymaga zalogowania (opcjonalnie konkretnej roli). */
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !hasRole(...(Array.isArray(role) ? role : [role]))) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
