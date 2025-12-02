import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const estadoConfig = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  aceptado: { label: 'Aceptado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  preparando: { label: 'Preparando', color: 'bg-purple-100 text-purple-800', icon: Package },
  listo_recoger: { label: 'Listo para recoger', color: 'bg-indigo-100 text-indigo-800', icon: Package },
  en_camino: { label: 'En camino', color: 'bg-orange-100 text-orange-800', icon: Truck },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function MisPedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
    
    const subscription = supabase
      .channel('pedidos_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pedidos',
        filter: `cliente_id=eq.${user.id}`
      }, () => {
        cargarPedidos();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  async function cargarPedidos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          tiendas(nombre),
          repartidores(usuario_id, usuarios(nombre))
        `)
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis pedidos</h1>

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-600">
              Explora las tiendas y haz tu primer pedido
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(pedido => {
              const config = estadoConfig[pedido.estado];
              const Icon = config.icon;
              
              return (
                <div key={pedido.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {pedido.tiendas?.nombre}
                      </div>
                      <div className="text-sm text-gray-600">
                        Pedido {pedido.numero_pedido}
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

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <div>Dirección: {pedido.direccion_entrega}</div>
                        {pedido.repartidores && (
                          <div className="mt-1">
                            Repartidor: {pedido.repartidores.usuarios?.nombre}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${pedido.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {pedido.tipo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                        </div>
                      </div>
                    </div>
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
