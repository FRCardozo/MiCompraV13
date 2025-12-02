// Formatear moneda
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Formatear fecha
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Formatear fecha corta
export function formatShortDate(timestamp) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Formatear tiempo relativo (hace X tiempo)
export function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`;
  return formatShortDate(timestamp);
}

// Capitalizar primera letra
export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Formatear estado de pedido
export function formatEstado(estado) {
  const estados = {
    'pendiente': 'Pendiente',
    'confirmado': 'Confirmado',
    'en_preparacion': 'En Preparación',
    'listo_recoger': 'Listo para Recoger',
    'en_camino': 'En Camino',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado'
  };
  return estados[estado] || capitalizeFirstLetter(estado);
}

// Obtener color del estado
export function getEstadoColor(estado) {
  const colores = {
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'confirmado': 'bg-blue-100 text-blue-800',
    'en_preparacion': 'bg-purple-100 text-purple-800',
    'listo_recoger': 'bg-orange-100 text-orange-800',
    'en_camino': 'bg-indigo-100 text-indigo-800',
    'entregado': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800'
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
}

// Formatear número de teléfono
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Truncar texto
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
