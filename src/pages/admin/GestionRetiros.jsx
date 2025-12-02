import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Check, X, Clock } from 'lucide-react';

export default function GestionRetiros() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendiente');

  useEffect(() => {
    cargarSolicitudes();
  }, [filtro]);

  async function cargarSolicitudes() {
    try {
      let query = supabase
        .from('solicitudes_retiro')
        .select(`
          *,
          repartidores(usuarios(nombre, email, telefono)),
          wallets(saldo_disponible)
        `)
        .order('created_at', { ascending: false });

      if (filtro !== 'todas') {
        query = query.eq('estado', filtro);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function aprobar(solicitud) {
    if (!confirm(`¿Aprobar retiro de $${solicitud.monto.toLocaleString()}?`)) return;

    try {
      // Actualizar estado de solicitud
      const { error: solicitudError } = await supabase
        .from('solicitudes_retiro')
        .update({
          estado: 'aprobado',
          fecha_aprobado: new Date().toISOString()
        })
        .eq('id', solicitud.id);

      if (solicitudError) throw solicitudError;

      // Actualizar wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          saldo_disponible: solicitud.wallets.saldo_disponible - solicitud.monto
        })
        .eq('id', solicitud.wallet_id);

      if (walletError) throw walletError;

      // Crear transacción
      const { error: transaccionError } = await supabase
        .from('transacciones_wallet')
        .insert([{
          wallet_id: solicitud.wallet_id,
          tipo: 'retiro',
          monto: -solicitud.monto,
          estado: 'completado',
          descripcion: `Retiro aprobado - Solicitud #${solicitud.id.substring(0, 8)}`
        }]);

      if (transaccionError) throw transaccionError;

      alert('Retiro aprobado exitosamente');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aprobar retiro');
    }
  }

  async function rechazar(solicitud) {
    const motivo = prompt('Motivo del rechazo:');
    if (!motivo) return;

    try {
      const { error } = await supabase
        .from('solicitudes_retiro')
        .update({
          estado: 'rechazado',
          notas_admin: motivo
        })
        .eq('id', solicitud.id);

      if (error) throw error;

      alert('Retiro rechazado');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar retiro');
    }
  }

  async function marcarPagado(solicitud) {
    if (!confirm('¿Marcar como pagado?')) return;

    try {
      const { error } = await supabase
        .from('solicitudes_retiro')
        .update({
          estado: 'pagado',
          fecha_pagado: new Date().toISOString()
        })
        .eq('id', solicitud.id);

      if (error) throw error;

      alert('Marcado como pagado');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al marcar como pagado');
    }
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestión de Retiros</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          {['pendiente', 'aprobado', 'rechazado', 'pagado', 'todas'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filtro === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="space-y-4">
        {solicitudes.map((solicitud) => (
          <div key={solicitud.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg">
                    {solicitud.repartidores?.usuarios?.nombre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {solicitud.repartidores?.usuarios?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {solicitud.repartidores?.usuarios?.telefono}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ${solicitud.monto.toLocaleString()}
                </p>
                <span className={`inline-block px-3 py-1 text-xs rounded-full mt-2 ${
                  solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  solicitud.estado === 'aprobado' ? 'bg-blue-100 text-blue-800' :
                  solicitud.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {solicitud.estado}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Saldo Disponible</p>
                <p className="font-semibold">${solicitud.wallets?.saldo_disponible?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Método de Pago</p>
                <p className="font-semibold">{solicitud.metodo_pago || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha Solicitud</p>
                <p className="font-semibold">
                  {new Date(solicitud.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Hora</p>
                <p className="font-semibold">
                  {new Date(solicitud.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {solicitud.datos_pago && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium mb-1">Datos de Pago:</p>
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(solicitud.datos_pago, null, 2)}
                </pre>
              </div>
            )}

            {solicitud.notas_admin && (
              <div className="bg-red-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-red-800 mb-1">Notas del Admin:</p>
                <p className="text-sm text-red-600">{solicitud.notas_admin}</p>
              </div>
            )}

            {/* Acciones */}
            {solicitud.estado === 'pendiente' && (
              <div className="flex gap-2">
                <button
                  onClick={() => aprobar(solicitud)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Aprobar
                </button>
                <button
                  onClick={() => rechazar(solicitud)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            )}

            {solicitud.estado === 'aprobado' && (
              <button
                onClick={() => marcarPagado(solicitud)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Check className="w-4 h-4" />
                Marcar como Pagado
              </button>
            )}
          </div>
        ))}

        {solicitudes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay solicitudes de retiro {filtro !== 'todas' && `en estado "${filtro}"`}</p>
          </div>
        )}
      </div>
    </div>
  );
}