import { supabase } from '../lib/supabase';

// Solicitar permisos de geolocalización
export async function requestLocationPermission() {
  if (!navigator.geolocation) {
    throw new Error('Geolocalización no soportada en este navegador');
  }

  return new Promise((resolve, reject) => {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        resolve(true);
      } else if (result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          (error) => reject(error)
        );
      } else {
        reject(new Error('Permiso de ubicación denegado'));
      }
    });
  });
}

// Obtener ubicación actual
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// Iniciar seguimiento de ubicación en tiempo real
export function startLocationTracking(repartidorId, onLocationUpdate, onError) {
  if (!navigator.geolocation) {
    onError(new Error('Geolocalización no soportada'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      try {
        // Actualizar ubicación en Supabase
        const { error } = await supabase
          .from('repartidores')
          .update({
            ubicacion_actual: `POINT(${location.lng} ${location.lat})`,
            ultima_ubicacion_at: new Date().toISOString()
          })
          .eq('id', repartidorId);

        if (error) throw error;

        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      } catch (error) {
        console.error('Error actualizando ubicación:', error);
        if (onError) onError(error);
      }
    },
    (error) => {
      console.error('Error obteniendo ubicación:', error);
      if (onError) onError(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    }
  );

  return watchId;
}

// Detener seguimiento de ubicación
export function stopLocationTracking(watchId) {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

// Calcular distancia entre dos puntos (fórmula de Haversine)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // en kilómetros
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Estimar tiempo de viaje (aproximado: 30 km/h promedio en ciudad)
export function estimateTravelTime(distanceKm) {
  const averageSpeedKmh = 30;
  const timeHours = distanceKm / averageSpeedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  return timeMinutes;
}

// Formatear distancia para mostrar
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Formatear tiempo para mostrar
export function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}
