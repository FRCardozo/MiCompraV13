// src/components/ClienteHeader.jsx
import { ShoppingBag, Home, Package, Bell, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ClienteHeader() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Marca */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900">MiCompra</span>
        </div>

        {/* Navegación estilo app */}
        <nav className="flex items-center gap-3 sm:gap-4 text-slate-700 text-xs">

          <NavLink
            to="/cliente"
            className={({ isActive }) =>
              `flex items-center gap-1 px-2 py-1 rounded-xl ${
                isActive
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-slate-100 text-slate-600'
              }`
            }
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </NavLink>

          <NavLink
            to="/cliente/pedidos"
            className={({ isActive }) =>
              `flex items-center gap-1 px-2 py-1 rounded-xl ${
                isActive
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-slate-100 text-slate-600'
              }`
            }
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Pedidos</span>
          </NavLink>

          <button
            className="flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-slate-100"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alertas</span>
          </button>

          {/* Botón Salir — SIEMPRE visible */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2 py-1 rounded-xl text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </nav>

      </div>
    </header>
  );
}
