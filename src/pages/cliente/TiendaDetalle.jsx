import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Plus, Minus, Trash2, Store, Clock, MapPin } from 'lucide-react';

export default function TiendaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTienda();
    cargarProductos();
  }, [id]);

  async function cargarTienda() {
    try {
      const { data, error } = await supabase
        .from('tiendas')
        .select('*, municipios(nombre)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTienda(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function cargarProductos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*, categorias_productos(nombre)')
        .eq('tienda_id', id)
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function agregarAlCarrito(producto) {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  }

  function actualizarCantidad(productoId, cantidad) {
    if (cantidad <= 0) {
      setCarrito(carrito.filter(item => item.id !== productoId));
    } else {
      setCarrito(carrito.map(item =>
        item.id === productoId ? { ...item, cantidad } : item
      ));
    }
  }

  function calcularTotal() {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  function irACheckout() {
    if (carrito.length === 0) return;
    navigate('/cliente/checkout', { state: { tienda, carrito } });
  }

  if (!tienda) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Tienda */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{tienda.nombre}</h1>
              <p className="text-gray-600 mt-1">{tienda.descripcion}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{tienda.municipios?.nombre}</span>
                </div>
                {tienda.horario_apertura && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tienda.horario_apertura} - {tienda.horario_cierre}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Productos</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay productos disponibles
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map(producto => (
              <div key={producto.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  {producto.imagen_url ? (
                    <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Store className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{producto.descripcion}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-blue-600">
                    ${producto.precio.toLocaleString()}
                  </span>
                  <button
                    onClick={() => agregarAlCarrito(producto)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Carrito Flotante */}
      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{carrito.length} productos</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                ${calcularTotal().toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {carrito.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="flex-1">{item.nombre}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                      className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => actualizarCantidad(item.id, 0)}
                      className="ml-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={irACheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continuar con el pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
