// src/pages/repartidor/RepartidorHome.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Wallet, Package, TrendingUp, Clock, MapPin, Navigation } from 'lucide-react';
import {
  startLocationTracking,
  stopLocationTracking,
  requestLocationPermission,
} from '../../utils/gps';

export default function RepartidorHome() {
  const { profile } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState({
    pedidosHoy: 0,
    pedidosDisponibles: 0,
    totalGanancias: 0,
  });
  const [loading, setLoading] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [repartidorId, setRepartidorId] = useState(null);

  useEffect(() => {
    // Si aún no hay perfil cargado, no hacemos nada
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  useEffect(() => {
    // Limpiar tracking al desmontar
    return () => {
      if (watchId) {
        stopLocationTracking(watchId);
      }
    };
  }, [watchId]);

  async function loadData() {
    try {
      setLoading(true);

      // 1) Obtener repartidor asociado al usuario
      const { data: repartidor, error: repartidorError } = await supabase
        .from('repartidores')
        .select('*')
        .eq('usuario_id', profile.id)
        .single();

      if (repartidorError) {
        console.error('Error cargando repartidor:', repartidorError);
        setLoading(false);
        return;
      }

      if (!repartidor) {
        console.warn('No se encontró registro de repartidor para este usuario');
        setLoading(false);
        return;
      }

      setRepartidorId(repartidor.id);

      // 2) Cargar wallet (la policy RLS ya filtra por usuario actual)
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select(
          'id, usuario_id, saldo, saldo_pendiente, saldo_disponible, total_recargado, total_retirado'
        )
        .maybeSingle();

      if (walletError) {
        console.error('Error cargando wallet:', walletError);
      }

      const emptyWallet = {
        saldo: 0,
        saldo_pendiente: 0,
        saldo_disponible: 0,
        total_recargado: 0,
        total_retirado: 0,
      };

      setWallet(walletData || emptyWallet);

      // 3) Cargar estadísticas
      const hoy = new Date().toISOString().split('T')[0];

      const { count: pedidosHoy, error: pedidosHoyError } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('repartidor_id', repartidor.id)
        .gte('created_at', hoy);

      if (pedidosHoyError) {
        console.error('Error contando pedidos de hoy:', pedidosHoyError);
      }

      const { count: disponibles, error: disponiblesError } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .is('repartidor_id', null)
        .eq('estado', 'listo_recoger');

      if (disponiblesError) {
        console.error('Error contando pedidos disponibles:', disponiblesError);
      }

      setStats({
        pedidosHoy: pedidosHoy || 0,
        pedidosDisponibles: disponibles || 0,
        totalGanancias: repartidor.total_ganancias || 0,
      });
    } catch (error) {
      console.error('Error cargando datos del repartidor:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleLocationTracking() {
    if (locationTracking) {
      // Detener tracking
      if (watchId) {
        stopLocationTracking(watchId);
        setWatchId(null);
      }
      setLocationTracking(false);
      setCurrentLocation(null);
    } else {
      // Iniciar tracking
      try {
        await requestLocationPermission();

        const id = startLocationTracking(
          repartidorId,
          (location) => {
            setCurrentLocation(location);
          },
          (error) => {
            console.error('Error en tracking:', error);
            alert('Error al obtener ubicación: ' + error.message);
          }
        );

        setWatchId(id);
        setLocationTracking(true);
      } catch (error) {
        console.error('Error solicitando permisos:', error);
        alert('Necesitas permitir el acceso a tu ubicación para usar esta función');
      }
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
            ¡Hola, {profile?.nombre}!
          </h1>
          <p className="text-gray-600">Panel de Repartidor</p>
        </div>

        {/* Estado de Ubicación */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  locationTracking ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                {locationTracking ? (
                  <Navigation className="w-6 h-6 text-green-600 animate-pulse" />
                ) : (
                  <MapPin className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {locationTracking ? 'Ubicación Activa' : 'Ubicación Desactivada'}
                </h3>
                <p className="text-sm text-gray-600">
                  {locationTracking
                    ? 'Los clientes pueden ver tu ubicación en tiempo real'
                    : 'Activa tu ubicación para recibir pedidos'}
                </p>
                {currentLocation && (
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {currentLocation.lat.toFixed(6)}, Lng:{' '}
                    {currentLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={toggleLocationTracking}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                locationTracking
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {locationTracking ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>

        {/* Wallet */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Mi Billetera</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-200 text-sm mb-2">Saldo Disponible</p>
              <p className="text-3xl font-bold">
                ${wallet?.saldo_disponible?.toLocaleString() || '0'}
              </p>
            </div>

            <div>
              <p className="text-blue-200 text-sm mb-2">Saldo Pendiente</p>
              <p className="text-3xl font-bold">
                ${wallet?.saldo_pendiente?.toLocaleString() || '0'}
              </p>
            </div>

            <div>
              <p className="text-blue-200 text-sm mb-2">Total Acumulado</p>
              <p className="text-3xl font-bold">
                ${stats.totalGanancias.toLocaleString()}
              </p>
            </div>
          </div>

          <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Solicitar Retiro
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.pedidosHoy}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Entregas Hoy</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.pedidosDisponibles}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Pedidos Disponibles
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                ${stats.totalGanancias.toLocaleString()}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Total Ganancias
            </h3>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <Package className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ver Pedidos Disponibles
            </h3>
            <p className="text-gray-600">
              Encuentra pedidos para entregar en tu zona
            </p>
          </button>

          <button className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <Clock className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Mis Entregas Activas
            </h3>
            <p className="text-gray-600">
              Gestiona tus entregas en curso
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
