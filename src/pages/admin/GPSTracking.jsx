import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Navigation, Clock, Bike } from 'lucide-react';
import MapView from '../../components/MapView';

export default function GPSTracking() {
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  const [mapCenter, setMapCenter] = useState([4.6097, -74.0817]); // Bogotá por defecto
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    cargarRepartidores();
    
    // Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel('repartidores-tracking')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'repartidores'
      }, (payload) => {
        setRepartidores(prev => prev.map(r => 
          r.id === payload.new.id ? { ...r, ...payload.new } : r
        ));
        
        // Actualizar marcadores si el repartidor seleccionado cambió
        if (selectedRepartidor?.id === payload.new.id && payload.new.ubicacion_actual) {
          updateMarkers([{ ...selectedRepartidor, ...payload.new }]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedRepartidor) {
      updateMarkers([selectedRepartidor]);
    }
  }, [selectedRepartidor]);

  function updateMarkers(reps) {
    const newMarkers = reps
      .filter(r => r.ubicacion_actual)
      .map(r => {
        // Parsear ubicación POINT(lng lat)
        const match = r.ubicacion_actual.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (!match) return null;
        
        const lng = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        
        return {
          id: r.id,
          lat,
          lng,
          popup: {
            title: r.usuarios?.nombre || 'Repartidor',
            description: `Última actualización: ${formatearTiempo(r.ultima_ubicacion_at)}`
          }
        };
      })
      .filter(Boolean);
    
    setMarkers(newMarkers);
    
    if (newMarkers.length > 0) {
      setMapCenter([newMarkers[0].lat, newMarkers[0].lng]);
    }
  }

  async function cargarRepartidores() {
    try {
      const { data, error } = await supabase
        .from('repartidores')
        .select('*, usuarios(nombre, telefono)')
        .eq('disponible', true);
      
      if (error) throw error;
      setRepartidores(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatearTiempo(timestamp) {
    if (!timestamp) return 'Sin ubicación';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutos = Math.floor(diff / 60000);
    if (minutos < 1) return 'Hace menos de 1 minuto';
    if (minutos < 60) return `Hace ${minutos} minutos`;
    const horas = Math.floor(minutos / 60);
    return `Hace ${horas} horas`;
  }

  if (loading) {
    return <div className="p-6">Cargando mapa...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">GPS Tracking en Tiempo Real</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de repartidores */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Repartidores Activos</h2>
            <div className="space-y-3">
              {repartidores.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedRepartidor(rep)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRepartidor?.id === rep.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bike className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{rep.usuarios?.nombre}</h3>
                      <p className="text-xs text-gray-500">{rep.usuarios?.telefono}</p>
                    </div>
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{formatearTiempo(rep.ultima_ubicacion_at)}</span>
                  </div>
                  
                  <div className="mt-2 text-xs">
                    <span className="text-gray-600">Entregas: </span>
                    <span className="font-semibold">{rep.total_entregas || 0}</span>
                  </div>
                </div>
              ))}
              
              {repartidores.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No hay repartidores activos
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 h-[600px]">
            {selectedRepartidor ? (
              <div className="h-full flex flex-col">
                <div className="mb-4 pb-4 border-b">
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedRepartidor.usuarios?.nombre}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Ubicación en tiempo real</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatearTiempo(selectedRepartidor.ultima_ubicacion_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 rounded-lg overflow-hidden">
                  <MapView
                    center={mapCenter}
                    zoom={14}
                    markers={markers}
                    height="100%"
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Entregas Hoy</p>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedRepartidor.total_entregas || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Ganancias</p>
                    <p className="text-xl font-bold text-green-600">
                      ${selectedRepartidor.total_ganancias?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Calificación</p>
                    <p className="text-xl font-bold text-purple-600">
                      {selectedRepartidor.calificacion_promedio?.toFixed(1) || '0.0'} ⭐
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Selecciona un repartidor para ver su ubicación</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instrucciones de implementación */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📍 Implementación GPS Completa</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Instalar: <code className="bg-blue-100 px-2 py-1 rounded">npm install leaflet react-leaflet</code></p>
          <p>• El repartidor envía su ubicación cada 10 segundos desde su app móvil</p>
          <p>• Supabase Realtime actualiza la posición automáticamente en este panel</p>
          <p>• El mapa muestra la ruta en tiempo real con marcadores animados</p>
        </div>
      </div>
    </div>
  );
}