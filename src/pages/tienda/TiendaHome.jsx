import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

export default function TiendaHome() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    pedidosPendientes: 0,
    pedidosHoy: 0,
    ventasHoy: 0,
    productosActivos: 0,
  });
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    try {
      // Obtener tienda del usuario
      const { data: tienda } = await supabase
        .from('tiendas')
        .select('id')
        .eq('usuario_id', profile?.id)
        .single();

      if (!tienda) return;

      // Cargar estadísticas
      const hoy = new Date().toISOString().split('T')[0];

      const { count: pendientes } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('tienda_id', tienda.id)
        .in('estado', ['pendiente', 'aceptado', 'preparando']);

      const { count: pedidosHoy } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('tienda_id', tienda.id)
        .gte('created_at', hoy);

      const { data: ventasData } = await supabase
        .from('pedidos')
        .select('total')
        .eq('tienda_id', tienda.id)
        .gte('created_at', hoy);

      const { count: productos } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('tienda_id', tienda.id)
        .eq('activo', true);

      const ventasHoy = ventasData?.reduce((sum, p) => sum + parseFloat(p.total), 0) || 0;

      setStats({
        pedidosPendientes: pendientes || 0,
        pedidosHoy: pedidosHoy || 0,
        ventasHoy,
        productosActivos: productos || 0,
      });

      // Cargar pedidos recientes
      const { data: pedidosData } = await supabase
        .from('pedidos')
        .select(`
          *,
          usuarios (nombre, telefono)
        `)
        .eq('tienda_id', tienda.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setPedidos(pedidosData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aceptado: 'bg-blue-100 text-blue-800',
      preparando: 'bg-purple-100 text-purple-800',
      listo_recoger: 'bg-green-100 text-green-800',
      en_camino: 'bg-indigo-100 text-indigo-800',
      entregado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

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
            Panel de Tienda
          </h1>
          <p className="text-gray-600">Gestiona tus pedidos y productos</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.pedidosPendientes}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Pedidos Pendientes</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.pedidosHoy}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Pedidos Hoy</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                ${stats.ventasHoy.toLocaleString()}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Ventas Hoy</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.productosActivos}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Productos Activos</h3>
          </div>
        </div>

        {/* Pedidos recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pedidos Recientes</h2>
          
          {pedidos.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        #{pedido.numero_pedido}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(pedido.estado)}`}>
                        {pedido.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cliente: {pedido.usuarios?.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ${parseFloat(pedido.total).toLocaleString()}
                    </p>
                  </div>
                  
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}