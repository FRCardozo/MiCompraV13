import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario existe pero el perfil no se ha cargado (error en DB/RLS)
  if (user && !profile && !loading) {
    console.error('Usuario autenticado sin perfil público cargado.');
    return <Navigate to="/login?error=profile_missing" replace />;
  }

  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.tipo_usuario)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}