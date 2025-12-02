import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { MapPin, CreditCard, DollarSign, Loader } from 'lucide-react';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tienda, carrito } = location.state || {};

  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [tipoPago, setTipoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  if (!tienda || !carrito) {
    navigate('/cliente');
    return null;
  }

  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const costoEnvio = 5000;
  const total = subtotal + costoEnvio;

  async function crearPedido() {
    if (!direccion.trim()) {
      alert('Por favor ingresa la dirección de entrega');
      return;
    }

    try {
      setLoading(true);

      const numeroPedido = `PED-${Date.now()}`;

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          numero_pedido: numeroPedido,
          cliente_id: user.id,
          tienda_id: tienda.id,
          estado: 'pendiente',
          subtotal,
          costo_envio: costoEnvio,
          tarifa_envio_final: costoEnvio,
          total,
          tipo_pago: tipoPago,
          direccion_entrega: direccion,
          notas,
          tiempo_estimado_minutos: 30
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      const items = carrito.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad
      }));

      const { error: itemsError } = await supabase
        .from('items_pedido')
        .insert(items);

      if (itemsError) throw itemsError;

      await supabase
        .from('notificaciones')
        .insert({
          usuario_id: tienda.usuario_id,
          tipo: 'nuevo_pedido',
          titulo: 'Nuevo pedido recibido',
          mensaje: `Pedido ${numeroPedido} por $${total.toLocaleString()}`,
          referencia_pedido_id: pedido.id
        });

      navigate('/cliente/pedido-confirmado', { state: { pedido } });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirmar pedido</h1>

        <div className="space-y-6">
          {/* Resumen del pedido */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
            <div className="space-y-2">
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span>${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Costo de envío</span>
                  <span>${costoEnvio.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección de entrega */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Dirección de entrega</h2>
            </div>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ingresa tu dirección completa"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales (opcional)"
              className="w-full border rounded-lg p-3 mt-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
            />
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Método de pago</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="pago"
                  value="efectivo"
                  checked={tipoPago === 'efectivo'}
                  onChange={(e) => setTipoPago(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Efectivo al recibir</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="pago"
                  value="transferencia"
                  checked={tipoPago === 'transferencia'}
                  onChange={(e) => setTipoPago(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Transferencia</span>
              </label>
            </div>
          </div>

          {/* Botón confirmar */}
          <button
            onClick={crearPedido}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              `Confirmar pedido - $${total.toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
