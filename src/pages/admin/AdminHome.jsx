import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Store, Users, Package, TrendingUp, MapPin, Settings, DollarSign, BarChart3, Navigation } from 'lucide-react';

export default function AdminHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTiendas: 0,
    totalRepartidores: 0,
    totalClientes: 0,
    pedidosHoy: 0,
    ventasHoy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const hoy = new Date().toISOString().split('T')[0];

      const { count: tiendas } = await supabase
        .from('tiendas')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);

      const { count: repartidores } = await supabase
        .from('repartidores')
        .select('*', { count: 'exact', head: true });

      const { count: clientes } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_usuario', 'cliente');

      const { count: pedidosHoy } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hoy);

      const { data: ventasData } = await supabase
        .from('pedidos')
        .select('total')
        .gte('created_at', hoy);

      const ventasHoy = ventasData?.reduce((sum, p) => sum + parseFloat(p.total), 0) || 0;

      setStats({
        totalTiendas: tiendas || 0,
        totalRepartidores: repartidores || 0,
        totalClientes: clientes || 0,
        pedidosHoy: pedidosHoy || 0,
        ventasHoy,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">Gestiona toda la plataforma MiCompra</p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Store className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalTiendas}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Tiendas Activas</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalRepartidores}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Repartidores</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalClientes}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Clientes</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.pedidosHoy}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Pedidos Hoy</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                ${stats.ventasHoy.toLocaleString()}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Ventas Hoy</h3>
          </div>
        </div>

        {/* Módulos de gestión */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/admin/municipios')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <MapPin className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Municipios</h3>
            <p className="text-gray-600">Gestionar municipios y cobertura</p>
          </button>

          <button 
            onClick={() => navigate('/admin/tiendas')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <Store className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tiendas</h3>
            <p className="text-gray-600">Crear y gestionar tiendas aliadas</p>
          </button>

          <button 
            onClick={() => navigate('/admin/repartidores')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <Users className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Repartidores</h3>
            <p className="text-gray-600">Gestionar repartidores y niveles</p>
          </button>

          <button 
            onClick={() => navigate('/admin/reportes')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <BarChart3 className="w-10 h-10 text-yellow-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reportes</h3>
            <p className="text-gray-600">Analytics y reportes completos</p>
          </button>

          <button 
            onClick={() => navigate('/admin/gps')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <Navigation className="w-10 h-10 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">GPS Tracking</h3>
            <p className="text-gray-600">Seguimiento en tiempo real</p>
          </button>

          <button 
            onClick={() => navigate('/admin/retiros')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <DollarSign className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Retiros</h3>
            <p className="text-gray-600">Gestionar solicitudes de retiro</p>
          </button>
        </div>
      </div>
    </div>
  );
}