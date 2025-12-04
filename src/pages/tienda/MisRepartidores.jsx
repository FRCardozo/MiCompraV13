// src/pages/tienda/MisRepartidores.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function MisRepartidores() {
  const { profile } = useAuth();
  const [tiendaId, setTiendaId] = useState(null);

  const [repartidoresPropios, setRepartidoresPropios] = useState([]);
  const [repartidoresGlobales, setRepartidoresGlobales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);

  useEffect(() => {
    if (!profile) return;

    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);

        // 1) Obtener la tienda del usuario (igual que en TiendaHome)
        const { data: tienda, error: tiendaError } = await supabase
          .from('tiendas')
          .select('id')
          .eq('usuario_id', profile.id)
          .single();

        if (tiendaError || !tienda) {
          console.error('Error obteniendo tienda:', tiendaError);
          setError('No se encontró la tienda asociada al usuario.');
          setCargando(false);
          return;
        }

        const tienda_id = tienda.id;
        setTiendaId(tienda_id);

        // 2) Repartidores propios de la tienda
        const { data: propios, error: errPropios } = await supabase
          .from('usuarios')
          .select(
            'id, nombre, email, telefono, nivel_confianza, activo, es_repartidor_global, tienda_id, tipo_usuario'
          )
          .eq('tipo_usuario', 'repartidor')
          .eq('es_repartidor_global', false)
          .eq('tienda_id', tienda_id)
          .order('nombre', { ascending: true });

        if (errPropios) {
          console.error(errPropios);
          setError('Ocurrió un error cargando tus repartidores.');
          setCargando(false);
          return;
        }

        // 3) Repartidores globales
        const { data: globales, error: errGlobales } = await supabase
          .from('usuarios')
          .select(
            'id, nombre, email, telefono, nivel_confianza, activo, es_repartidor_global, tienda_id, tipo_usuario'
          )
          .eq('tipo_usuario', 'repartidor')
          .eq('es_repartidor_global', true)
          .order('nombre', { ascending: true });

        if (errGlobales) {
          console.error(errGlobales);
          setError('Ocurrió un error cargando los repartidores globales.');
          setCargando(false);
          return;
        }

        setRepartidoresPropios(propios || []);
        setRepartidoresGlobales(globales || []);
        setCargando(false);
      } catch (e) {
        console.error(e);
        setError('Error cargando los repartidores.');
        setCargando(false);
      }
    };

    cargarDatos();
  }, [profile]);

  const cambiarNivel = async (repartidorId, nuevoNivel) => {
    if (!tiendaId) return;

    try {
      setActualizandoId(repartidorId);
      setError(null);

      const { error } = await supabase
        .from('usuarios')
        .update({ nivel_confianza: nuevoNivel })
        .eq('id', repartidorId)
        .eq('tienda_id', tiendaId)
        .eq('es_repartidor_global', false); // solo propios

      if (error) {
        console.error(error);
        setError('No se pudo actualizar el nivel de confianza.');
        return;
      }

      setRepartidoresPropios((prev) =>
        prev.map((r) =>
          r.id === repartidorId ? { ...r, nivel_confianza: nuevoNivel } : r
        )
      );
    } finally {
      setActualizandoId(null);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Repartidores
          </h1>
          <p className="text-gray-600 text-sm">
            Administra tus repartidores propios y consulta los repartidores
            globales disponibles como apoyo.
          </p>
        </header>

        {/* Repartidores propios */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            🟣 Mis repartidores
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Estos repartidores pertenecen a tu negocio. Puedes ajustar su nivel
            de confianza.
          </p>

          {repartidoresPropios.length === 0 ? (
            <p className="text-sm text-gray-600">
              No tienes repartidores registrados aún.
            </p>
          ) : (
            <div className="grid gap-4">
              {repartidoresPropios.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {rep.nombre || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-gray-600">{rep.email}</p>
                      {rep.telefono && (
                        <p className="text-sm text-gray-600">
                          📱 {rep.telefono}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rep.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rep.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nivel de confianza:
                    </label>
                    <select
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      value={rep.nivel_confianza || 3}
                      disabled={actualizandoId === rep.id}
                      onChange={(e) =>
                        cambiarNivel(rep.id, Number(e.target.value))
                      }
                    >
                      <option value={1}>⭐ 1</option>
                      <option value={2}>⭐⭐ 2</option>
                      <option value={3}>⭐⭐⭐ 3</option>
                      <option value={4}>⭐⭐⭐⭐ 4</option>
                      <option value={5}>⭐⭐⭐⭐⭐ 5</option>
                    </select>
                  </div>

                  <p className="text-xs text-gray-500">
                    La asignación de pedidos se podrá automatizar para repartir
                    mejor la carga entre tu equipo, pero aquí controlas el
                    nivel de confianza de cada repartidor.
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Repartidores globales */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            🌐 Repartidores globales
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Estos repartidores pertenecen a la plataforma. Puedes usarlos como
            apoyo en momentos de alta demanda, pero no modificar su información.
          </p>

          {repartidoresGlobales.length === 0 ? (
            <p className="text-sm text-gray-600">
              No hay repartidores globales disponibles por el momento.
            </p>
          ) : (
            <div className="grid gap-4">
              {repartidoresGlobales.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {rep.nombre || 'Repartidor global'}
                      </p>
                      <p className="text-sm text-gray-600">{rep.email}</p>
                      {rep.telefono && (
                        <p className="text-sm text-gray-600">
                          📱 {rep.telefono}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🌐 Global
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Estos repartidores son gestionados por la plataforma y se
                    usarán como respaldo cuando tus repartidores propios no sean
                    suficientes.
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
