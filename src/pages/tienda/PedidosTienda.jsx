import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Truck, Eye } from 'lucide-react';

const estadoConfig = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  aceptado: { label: 'Aceptado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  preparando: { label: 'Preparando', color: 'bg-purple-100 text-purple-800', icon: Package },
  listo_recoger: { label: 'Listo', color: 'bg-indigo-100 text-indigo-800', icon: Package },
  en_camino: { label: 'En camino', color: 'bg-orange-100 text-orange-800', icon: Truck },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function PedidosTienda() {
  const { user, profile } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    if (profile?.id) {
      cargarPedidos();
      
      const subscription = supabase
        .channel('pedidos_tienda')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'pedidos'
        }, () => {
          cargarPedidos();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [profile]);

  async function cargarPedidos() {
    try {
      setLoading(true);
      
      const { data: tienda } = await supabase
        .from('tiendas')
        .select('id')
        .eq('usuario_id', user.id)
        .single();

      if (!tienda) return;

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          usuarios!pedidos_cliente_id_fkey(nombre, telefono),
          repartidores(usuario_id, usuarios(nombre, telefono)),
          items_pedido(*, productos(nombre))
        `)
        .eq('tienda_id', tienda.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function cambiarEstado(pedidoId, nuevoEstado) {
    try {
      const updates = { estado: nuevoEstado };
      
      if (nuevoEstado === 'aceptado') updates.fecha_aceptado = new Date().toISOString();
      if (nuevoEstado === 'listo_recoger') updates.fecha_listo = new Date().toISOString();

      const { error } = await supabase
        .from('pedidos')
        .update(updates)
        .eq('id', pedidoId);

      if (error) throw error;

      const pedido = pedidos.find(p => p.id === pedidoId);
      await supabase
        .from('notificaciones')
        .insert({
          usuario_id: pedido.cliente_id,
          tipo: 'cambio_estado_pedido',
          titulo: 'Estado de pedido actualizado',
          mensaje: `Tu pedido ${pedido.numero_pedido} está ${estadoConfig[nuevoEstado].label.toLowerCase()}`,
          referencia_pedido_id: pedidoId
        });

      cargarPedidos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado');
    }
  }

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'todos') return true;
    if (filtro === 'activos') return !['entregado', 'cancelado'].includes(p.estado);
    return p.estado === filtro;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de pedidos</h1>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'activos', label: 'Activos' },
            { value: 'pendiente', label: 'Pendientes' },
            { value: 'preparando', label: 'Preparando' },
            { value: 'listo_recoger', label: 'Listos' },
            { value: 'entregado', label: 'Entregados' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filtro === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No hay pedidos
            </h2>
            <p className="text-gray-600">
              Los pedidos aparecerán aquí cuando los clientes realicen compras
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pedidosFiltrados.map(pedido => {
              const config = estadoConfig[pedido.estado];
              const Icon = config.icon;
              
              return (
                <div key={pedido.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg text-gray-900">
                        {pedido.numero_pedido}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Cliente: {pedido.usuarios?.nombre}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(pedido.created_at).toLocaleString('es-CO')}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${config.color}`}>
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </div>

                  <div className="border-t border-b py-3 mb-3">
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Productos:</strong>
                    </div>
                    {pedido.items_pedido?.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex justify-between">
                        <span>{item.cantidad}x {item.productos?.nombre}</span>
                        <span>${item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600">
                      <div>Dirección: {pedido.direccion_entrega}</div>
                      <div>Pago: {pedido.tipo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ${pedido.total.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    {pedido.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => cambiarEstado(pedido.id, 'aceptado')}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => cambiarEstado(pedido.id, 'cancelado')}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {pedido.estado === 'aceptado' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'preparando')}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Iniciar preparación
                      </button>
                    )}
                    {pedido.estado === 'preparando' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'listo_recoger')}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Marcar como listo
                      </button>
                    )}
                    {['listo_recoger', 'en_camino', 'entregado'].includes(pedido.estado) && (
                      <button
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
