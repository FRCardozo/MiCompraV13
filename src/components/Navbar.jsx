// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  LogOut,
  Home,
  Package,
  Truck,
  Settings,
} from 'lucide-react';
import NotificationsBell from './NotificationsBell';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  if (!user || !profile) return null;

  const getHomeRoute = () => {
    switch (profile.tipo_usuario) {
      case 'cliente':
        return '/cliente';
      case 'tienda':
        return '/tienda';
      case 'repartidor':
        return '/repartidor';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Marca */}
          <Link
            to={getHomeRoute()}
            className="flex items-center gap-2 min-w-0"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm sm:text-lg font-bold text-slate-900 truncate">
              MiCompra
            </span>
          </Link>

          {/* Navegación – versión compacta en móvil, completa en desktop */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Inicio */}
            <Link
              to={getHomeRoute()}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <span className="hidden sm:inline text-sm font-medium text-slate-700">
                Inicio
              </span>
            </Link>

            {/* Pedidos según rol */}
            {profile.tipo_usuario === 'cliente' && (
              <Link
                to="/cliente/mis-pedidos"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                <span className="hidden sm:inline text-sm font-medium text-slate-700">
                  Pedidos
                </span>
              </Link>
            )}

            {profile.tipo_usuario === 'tienda' && (
              <Link
                to="/tienda/pedidos"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                <span className="hidden sm:inline text-sm font-medium text-slate-700">
                  Pedidos
                </span>
              </Link>
            )}

            {profile.tipo_usuario === 'repartidor' && (
              <>
                <Link
                  to="/repartidor/disponibles"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                >
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  <span className="hidden sm:inline text-sm font-medium text-slate-700">
                    Disponibles
                  </span>
                </Link>
                <Link
                  to="/repartidor/entregas"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                >
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  <span className="hidden sm:inline text-sm font-medium text-slate-700">
                    Entregas
                  </span>
                </Link>
              </>
            )}

            {profile.tipo_usuario === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                <span className="hidden sm:inline text-sm font-medium text-slate-700">
                  Admin
                </span>
              </Link>
            )}

            {/* Campana */}
            <div className="flex-shrink-0">
              <NotificationsBell />
            </div>

            {/* Botón Salir – ICONO SIEMPRE VISIBLE */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              <span className="hidden sm:inline text-sm font-medium text-red-600">
                Salir
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
