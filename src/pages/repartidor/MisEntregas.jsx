import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Package, MapPin, Phone, CheckCircle } from 'lucide-react';

export default function MisEntregas() {
  const { user } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repartidor, setRepartidor] = useState(null);

  useEffect(() => {
    cargarRepartidor();
  }, [user.id]);

  useEffect(() => {
    if (repartidor) {
      cargarEntregas();
      
      const subscription = supabase
        .channel('mis_entregas')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `repartidor_id=eq.${repartidor.id}`
        }, () => {
          cargarEntregas();
        })
        .subscribe();

      return () => subscription.unsubscribe();
    }
  }, [repartidor]);

  async function cargarRepartidor() {
    try {
      const { data } = await supabase
        .from('repartidores')
        .select('*')
        .eq('usuario_id', user.id)
        .single();
      
      setRepartidor(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function cargarEntregas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          tiendas(nombre, direccion, telefono),
          usuarios!pedidos_cliente_id_fkey(nombre, telefono)
        `)
        .eq('repartidor_id', repartidor.id)
        .in('estado', ['en_camino'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntregas(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function marcarEntregado(pedidoId) {
    if (!confirm('¿Confirmas que el pedido fue entregado?')) return;

    try {
      const pedido = entregas.find(p => p.id === pedidoId);
      
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .update({
          estado: 'entregado',
          fecha_entregado: new Date().toISOString(),
          pago_confirmado: true
        })
        .eq('id', pedidoId);

      if (pedidoError) throw pedidoError;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (wallet) {
        const ganancia = pedido.tarifa_envio_final || 5000;
        
        await supabase
          .from('wallets')
          .update({
            saldo: wallet.saldo + ganancia,
            saldo_disponible: wallet.saldo_disponible + ganancia
          })
          .eq('id', wallet.id);

        await supabase
          .from('transacciones_wallet')
          .insert({
            wallet_id: wallet.id,
            tipo: 'ingreso_pedido',
            monto: ganancia,
            estado: 'completado',
            referencia_pedido_id: pedidoId,
            descripcion: `Entrega de pedido ${pedido.numero_pedido}`
          });
      }

      await supabase
        .from('repartidores')
        .update({
          total_entregas: repartidor.total_entregas + 1,
          total_ganancias: repartidor.total_ganancias + (pedido.tarifa_envio_final || 5000)
        })
        .eq('id', repartidor.id);

      await supabase.from('notificaciones').insert({
        usuario_id: pedido.cliente_id,
        tipo: 'pedido_entregado',
        titulo: 'Pedido entregado',
        mensaje: `Tu pedido ${pedido.numero_pedido} ha sido entregado`,
        referencia_pedido_id: pedidoId
      });

      cargarEntregas();
      cargarRepartidor();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al marcar como entregado');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis entregas activas</h1>

        {entregas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes entregas activas
            </h2>
            <p className="text-gray-600">
              Acepta pedidos para comenzar a entregar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entregas.map(entrega => (
              <div key={entrega.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      {entrega.numero_pedido}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {entrega.tiendas?.nombre}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    En camino
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Cliente</div>
                    <div className="font-semibold text-gray-900">{entrega.usuarios?.nombre}</div>
                    <a
                      href={`tel:${entrega.usuarios?.telefono}`}
                      className="flex items-center gap-2 text-sm text-blue-600 mt-1"
                    >
                      <Phone className="w-4 h-4" />
                      {entrega.usuarios?.telefono}
                    </a>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-gray-600">Dirección de entrega:</div>
                      <div className="font-medium">{entrega.direccion_entrega}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="text-sm text-gray-600">
                      Total a cobrar:
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${entrega.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Método de pago: <span className="font-semibold">
                      {entrega.tipo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => marcarEntregado(entrega.id)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marcar como entregado
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
