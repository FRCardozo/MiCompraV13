// src/pages/admin/GestionRepartidores.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Bike } from 'lucide-react';

const initialFormData = {
  usuario_id: '',
  nivel_id: '',
  medio_transporte: 'Moto',
  placa: '',
  disponible: true,
};

export default function GestionRepartidores() {
  const [repartidores, setRepartidores] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [repartidoresRes, nivelesRes, usuariosRes] = await Promise.all([
        supabase
          .from('repartidores')
          .select(
            '*, usuarios(nombre, email, telefono), niveles_repartidor(nombre, nivel)'
          )
          .order('created_at', { ascending: false }),
        supabase.from('niveles_repartidor').select('*').order('nivel'),
        supabase.from('usuarios').select('*').eq('tipo_usuario', 'repartidor'),
      ]);

      setRepartidores(repartidoresRes.data || []);
      setNiveles(nivelesRes.data || []);
      setUsuarios(usuariosRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function guardar() {
    try {
      // Nunca mandamos string vacío a columnas uuid
      const payload = {
        ...formData,
        nivel_id: formData.nivel_id || null,
      };

      if (editando) {
        const { error } = await supabase
          .from('repartidores')
          .update(payload)
          .eq('id', editando);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('repartidores')
          .insert([payload])
          .select('id, usuario_id')
          .single();
        if (error) throw error;

        // Crear wallet automáticamente para el usuario del repartidor
        const { error: walletError } = await supabase
          .from('wallets')
          .insert([{ usuario_id: payload.usuario_id }]);

        if (walletError) {
          console.error('Error creando wallet:', walletError);
        }
      }

      cancelar();
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este repartidor?')) return;

    try {
      const { error } = await supabase
        .from('repartidores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  }

  function editar(repartidor) {
    setEditando(repartidor.id);
    setNuevo(false);
    setFormData({
      usuario_id: repartidor.usuario_id || '',
      nivel_id: repartidor.nivel_id || '',
      medio_transporte: repartidor.medio_transporte || 'Moto',
      placa: repartidor.placa || '',
      disponible:
        typeof repartidor.disponible === 'boolean'
          ? repartidor.disponible
          : true,
    });
  }

  function cancelar() {
    setEditando(null);
    setNuevo(false);
    setFormData(initialFormData);
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Repartidores</h1>
        <button
          onClick={() => {
            setEditando(null);
            setFormData(initialFormData);
            setNuevo(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Repartidor
        </button>
      </div>

      {(nuevo || editando) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editando ? 'Editar Repartidor' : 'Nuevo Repartidor'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium mb-1">Usuario</label>
              <select
                value={formData.usuario_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, usuario_id: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                disabled={!!editando}
              >
                <option value="">Seleccionar usuario</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-sm font-medium mb-1">Nivel</label>
              <select
                value={formData.nivel_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, nivel_id: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seleccionar nivel</option>
                {niveles.map((n) => (
                  <option key={n.id} value={n.id}>
                    Nivel {n.nivel} - {n.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Medio de transporte */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Medio de Transporte
              </label>
              <select
                value={formData.medio_transporte || 'Moto'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medio_transporte: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Moto">Moto</option>
                <option value="Bicicleta">Bicicleta</option>
                <option value="Carro">Carro</option>
                <option value="A pie">A pie</option>
              </select>
            </div>

            {/* Placa */}
            <div>
              <label className="block text-sm font-medium mb-1">Placa</label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) =>
                  setFormData({ ...formData, placa: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="ABC123"
              />
            </div>

            {/* Disponible */}
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData.disponible}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disponible: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Disponible</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={guardar}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              onClick={cancelar}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Cards de repartidores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repartidores.map((repartidor) => (
          <div key={repartidor.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">
                    {repartidor.usuarios?.nombre}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {repartidor.usuarios?.email}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  repartidor.disponible
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {repartidor.disponible ? 'Disponible' : 'No disponible'}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <p className="text-sm text-gray-600">
                📱 {repartidor.usuarios?.telefono}
              </p>
              <p className="text-sm text-gray-600">
                🏆 {repartidor.niveles_repartidor?.nombre}
              </p>
              <p className="text-sm text-gray-600">
                🚗 {repartidor.medio_transporte}{' '}
                {repartidor.placa && `(${repartidor.placa})`}
              </p>
              <p className="text-sm text-gray-600">
                📦 {repartidor.total_entregas} entregas
              </p>
              <p className="text-sm text-gray-600">
                💰 $
                {repartidor.total_ganancias?.toLocaleString() || 0}
              </p>
              {repartidor.calificacion_promedio > 0 && (
                <p className="text-sm text-gray-600">
                  ⭐ {repartidor.calificacion_promedio.toFixed(1)}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => editar(repartidor)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => eliminar(repartidor.id)}
                className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
