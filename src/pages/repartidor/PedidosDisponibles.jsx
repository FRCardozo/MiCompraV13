import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Package, MapPin, DollarSign, Clock, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import MapView from '../../components/MapView';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { calculateDistance, estimateTravelTime, formatDistance, formatTime } from '../../utils/gps';
import { formatCurrency } from '../../utils/format';

export default function PedidosDisponibles() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repartidor, setRepartidor] = useState(null);
  const [aceptando, setAceptando] = useState(null);

  useEffect(() => {
    cargarRepartidor();
  }, [user.id]);

  useEffect(() => {
    if (repartidor) {
      cargarPedidos();
      
      const subscription = supabase
        .channel('pedidos_disponibles')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'pedidos'
        }, () => {
          cargarPedidos();
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

  async function cargarPedidos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          tiendas(nombre, direccion, municipio_id, ubicacion),
          usuarios!pedidos_cliente_id_fkey(nombre, telefono)
        `)
        .eq('estado', 'listo_recoger')
        .is('repartidor_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Calcular distancias y tiempos para cada pedido
      const pedidosConDistancia = (data || []).map(pedido => {
        let distancia = null;
        let tiempoEstimado = null;
        
        if (pedido.tiendas?.ubicacion && pedido.ubicacion_entrega) {
          try {
            // Parsear ubicaciones GEOGRAPHY(POINT)
            const tiendaMatch = pedido.tiendas.ubicacion.match(/POINT\(([^ ]+) ([^ ]+)\)/);
            const entregaMatch = pedido.ubicacion_entrega.match(/POINT\(([^ ]+) ([^ ]+)\)/);
            
            if (tiendaMatch && entregaMatch) {
              const tiendaLng = parseFloat(tiendaMatch[1]);
              const tiendaLat = parseFloat(tiendaMatch[2]);
              const entregaLng = parseFloat(entregaMatch[1]);
              const entregaLat = parseFloat(entregaMatch[2]);
              
              distancia = calculateDistance(
                { lat: tiendaLat, lng: tiendaLng },
                { lat: entregaLat, lng: entregaLng }
              );
              
              tiempoEstimado = estimateTravelTime(distancia);
            }
          } catch (e) {
            console.error('Error calculando distancia:', e);
          }
        }
        
        return {
          ...pedido,
          distanciaCalculada: distancia,
          tiempoEstimadoCalculado: tiempoEstimado
        };
      });
      
      setPedidos(pedidosConDistancia);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function aceptarPedido(pedidoId) {
    try {
      setAceptando(pedidoId);
      
      // Actualización atómica con condiciones de prevención de colisiones
      const { data, error } = await supabase
        .from('pedidos')
        .update({
          repartidor_id: repartidor.id,
          estado: 'en_camino',
          fecha_en_camino: new Date().toISOString()
        })
        .eq('id', pedidoId)
        .is('repartidor_id', null) // Condición 1: debe seguir sin repartidor
        .eq('estado', 'listo_recoger') // Condición 2: debe seguir en estado listo_recoger
        .select()
        .single();

      if (error || !data) {
        // El pedido ya fue tomado por otro repartidor
        alert('⚠️ Este pedido ya fue tomado por otro repartidor o ya no está disponible.');
        cargarPedidos();
        return;
      }

      // Crear notificación para el cliente
      const pedido = pedidos.find(p => p.id === pedidoId);
      await supabase.from('notificaciones').insert({
        usuario_id: pedido.cliente_id,
        tipo: 'pedido_en_camino',
        titulo: '🚴 Repartidor en camino',
        mensaje: `Tu pedido ${pedido.numero_pedido} está en camino. ¡Llegará pronto!`,
        referencia_pedido_id: pedidoId
      });

      // Notificación para la tienda
      await supabase.from('notificaciones').insert({
        usuario_id: pedido.tiendas?.usuario_id,
        tipo: 'pedido_asignado',
        titulo: '✅ Pedido asignado',
        mensaje: `El pedido ${pedido.numero_pedido} fue asignado a un repartidor`,
        referencia_pedido_id: pedidoId
      });

      alert('✅ ¡Pedido aceptado exitosamente! Dirígete a recogerlo.');
      cargarPedidos();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al aceptar el pedido. Por favor intenta de nuevo.');
    } finally {
      setAceptando(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <LoadingSpinner size="lg" text="Cargando pedidos disponibles..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pedidos disponibles</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>

        {pedidos.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No hay pedidos disponibles"
            description="Los pedidos listos para recoger aparecerán aquí. Mantente atento para nuevas oportunidades."
          />
        ) : (
          <div className="space-y-6">
            {pedidos.map(pedido => {
              // Parsear ubicaciones para el mapa
              let markers = [];
              try {
                const tiendaMatch = pedido.tiendas?.ubicacion?.match(/POINT\(([^ ]+) ([^ ]+)\)/);
                const entregaMatch = pedido.ubicacion_entrega?.match(/POINT\(([^ ]+) ([^ ]+)\)/);
                
                if (tiendaMatch) {
                  markers.push({
                    position: [parseFloat(tiendaMatch[2]), parseFloat(tiendaMatch[1])],
                    popup: `📍 Recoger: ${pedido.tiendas.nombre}`,
                    color: 'orange'
                  });
                }
                
                if (entregaMatch) {
                  markers.push({
                    position: [parseFloat(entregaMatch[2]), parseFloat(entregaMatch[1])],
                    popup: `🏠 Entregar: ${pedido.direccion_entrega}`,
                    color: 'blue'
                  });
                }
              } catch (e) {
                console.error('Error parseando ubicaciones:', e);
              }

              return (
                <div key={pedido.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Header con número de pedido y ganancia */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-lg">
                          {pedido.numero_pedido}
                        </div>
                        <div className="text-blue-100 text-sm">
                          {pedido.tiendas?.nombre}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                          {formatCurrency(pedido.tarifa_envio_final || 5000)}
                        </div>
                        <div className="text-xs text-blue-100">Tu ganancia</div>
                      </div>
                    </div>
                  </div>

                  {/* Mapa */}
                  {markers.length > 0 && (
                    <div className="h-48">
                      <MapView
                        center={markers[0].position}
                        zoom={14}
                        markers={markers}
                      />
                    </div>
                  )}

                  {/* Información del pedido */}
                  <div className="p-4 space-y-3">
                    {/* Distancia y tiempo */}
                    {pedido.distanciaCalculada && (
                      <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <Navigation className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-600">Distancia</div>
                            <div className="font-semibold text-gray-900">
                              {formatDistance(pedido.distanciaCalculada)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-600">Tiempo estimado</div>
                            <div className="font-semibold text-gray-900">
                              {formatTime(pedido.tiempoEstimadoCalculado)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Direcciones */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-gray-600 text-xs">Recoger en:</div>
                          <div className="font-medium text-gray-900">{pedido.tiendas?.direccion}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-gray-600 text-xs">Entregar en:</div>
                          <div className="font-medium text-gray-900">{pedido.direccion_entrega}</div>
                        </div>
                      </div>
                    </div>

                    {/* Total del pedido */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Total del pedido</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(pedido.total)}
                      </span>
                    </div>

                    {/* Botón de aceptar */}
                    <button
                      onClick={() => aceptarPedido(pedido.id)}
                      disabled={aceptando === pedido.id}
                      className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        aceptando === pedido.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {aceptando === pedido.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Aceptando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Aceptar pedido
                        </>
                      )}
                    </button>
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
