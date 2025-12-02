import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Clock, MapPin } from 'lucide-react';

export default function PedidoConfirmado() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pedido } = location.state || {};

  if (!pedido) {
    navigate('/cliente');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pedido confirmado!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido recibido y está siendo procesado
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Número de pedido</div>
            <div className="text-xl font-bold text-blue-600">{pedido.numero_pedido}</div>
          </div>

          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center gap-3 text-sm">
              <Package className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-gray-600">Estado</div>
                <div className="font-semibold">Pendiente</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-gray-600">Tiempo estimado</div>
                <div className="font-semibold">{pedido.tiempo_estimado_minutos} minutos</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-gray-600">Dirección de entrega</div>
                <div className="font-semibold">{pedido.direccion_entrega}</div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>${pedido.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Envío</span>
              <span>${pedido.costo_envio.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-blue-600">${pedido.total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/cliente/mis-pedidos')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
          >
            Ver mis pedidos
          </button>
          
          <button
            onClick={() => navigate('/cliente')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
