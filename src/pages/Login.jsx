// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Mail,
  Lock,
  Loader,
  AlertCircle,
  UserPlus2,
  Store,
  Bike
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirigir automáticamente si ya hay sesión activa
  useEffect(() => {
    if (!authLoading && user && profile) {
      redirectByRole(profile.tipo_usuario);
    }
  }, [authLoading, user, profile]);

  const redirectByRole = (tipoUsuario) => {
    switch (tipoUsuario) {
      case 'cliente':
        navigate('/cliente', { replace: true });
        break;
      case 'tienda':
        navigate('/tienda', { replace: true });
        break;
      case 'repartidor':
        navigate('/repartidor', { replace: true });
        break;
      case 'admin':
        navigate('/admin', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(
          'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.'
        );
        setIsSubmitting(false);
        return;
      }

      // El AuthContext redirige cuando cargue el perfil
    } catch (err) {
      console.error('Error en login:', err);
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || authLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Panel izquierdo: branding tipo app */}
        <div className="hidden md:flex flex-col justify-between h-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur shadow-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-700">
                Tu mercado en minutos
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              Todo lo que necesitas,<br />
              en un solo lugar.
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md">
              MiCompra funciona como las grandes apps de delivery:
              crea tu cuenta, elige tus tiendas favoritas y recibe tus pedidos
              en pocos minutos, sin complicaciones.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Ventajas para ti
            </p>
            <div className="grid grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="bg-white/80 rounded-2xl p-3 shadow-sm">
                <p className="font-semibold mb-1">Rápido</p>
                <p className="text-[11px]">
                  Pedidos entregados en minutos
                </p>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 shadow-sm">
                <p className="font-semibold mb-1">Seguro</p>
                <p className="text-[11px]">
                  Pagos y datos protegidos
                </p>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 shadow-sm">
                <p className="font-semibold mb-1">Cercano</p>
                <p className="text-[11px]">
                  Apoya a tiendas de tu municipio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho: formulario */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/60 p-6 sm:p-8 relative overflow-hidden">
          {/* Badge superior */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Bienvenido a
                </p>
                <p className="text-xl font-bold text-slate-900">MiCompra</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-blue-50 text-[11px] font-medium text-blue-700 border border-blue-100">
              Versión de pruebas
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50/60"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50/60"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isBusy ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {authLoading ? 'Verificando sesión...' : 'Iniciando sesión...'}
                </>
              ) : (
                'Entrar a MiCompra'
              )}
            </button>
          </form>

          {/* Registro “bonito” */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3">
              ¿Aún no tienes cuenta? Elige cómo quieres usar MiCompra:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <Link
                to="/registro"
                className="group bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl px-3 py-3 flex items-center gap-3 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-xs">
                    Cliente
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Pide en tus tiendas favoritas
                  </p>
                </div>
              </Link>

              <Link
                to="/registro-tienda"
                className="group bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 rounded-2xl px-3 py-3 flex items-center gap-3 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-xs">
                    Tienda
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Vende tus productos en línea
                  </p>
                </div>
              </Link>

              <Link
                to="/registro-repartidor"
                className="group bg-slate-50 hover:bg-green-50 border border-slate-100 hover:border-green-200 rounded-2xl px-3 py-3 flex items-center gap-3 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-xs">
                    Repartidor
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Gana dinero entregando pedidos
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
