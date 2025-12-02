import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Store } from 'lucide-react';

export default function GestionTiendas() {
  const [tiendas, setTiendas] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState(false);
  const [formData, setFormData] = useState({
    usuario_id: '',
    nombre: '',
    descripcion: '',
    direccion: '',
    municipio_id: '',
    telefono: '',
    horario_apertura: '08:00',
    horario_cierre: '20:00',
    activo: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [tiendasRes, municipiosRes, usuariosRes] = await Promise.all([
        supabase.from('tiendas').select('*, municipios(nombre), usuarios(nombre, email)').order('nombre'),
        supabase.from('municipios').select('*').eq('activo', true),
        supabase.from('usuarios').select('*').eq('tipo_usuario', 'tienda')
      ]);

      setTiendas(tiendasRes.data || []);
      setMunicipios(municipiosRes.data || []);
      setUsuarios(usuariosRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function guardar() {
    try {
      if (editando) {
        const { error } = await supabase
          .from('tiendas')
          .update(formData)
          .eq('id', editando);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tiendas')
          .insert([formData]);
        if (error) throw error;
      }
      
      cancelar();
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta tienda?')) return;
    
    try {
      const { error } = await supabase
        .from('tiendas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  }

  function editar(tienda) {
    setEditando(tienda.id);
    setFormData({
      usuario_id: tienda.usuario_id,
      nombre: tienda.nombre,
      descripcion: tienda.descripcion || '',
      direccion: tienda.direccion,
      municipio_id: tienda.municipio_id,
      telefono: tienda.telefono || '',
      horario_apertura: tienda.horario_apertura || '08:00',
      horario_cierre: tienda.horario_cierre || '20:00',
      activo: tienda.activo
    });
    setNuevo(false);
  }

  function cancelar() {
    setEditando(null);
    setNuevo(false);
    setFormData({
      usuario_id: '',
      nombre: '',
      descripcion: '',
      direccion: '',
      municipio_id: '',
      telefono: '',
      horario_apertura: '08:00',
      horario_cierre: '20:00',
      activo: true
    });
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Tiendas</h1>
        <button
          onClick={() => setNuevo(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Tienda
        </button>
      </div>

      {(nuevo || editando) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editando ? 'Editar Tienda' : 'Nueva Tienda'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Usuario</label>
              <select
                value={formData.usuario_id}
                onChange={(e) => setFormData({...formData, usuario_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seleccionar usuario</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Municipio</label>
              <select
                value={formData.municipio_id}
                onChange={(e) => setFormData({...formData, municipio_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seleccionar municipio</option>
                {municipios.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Horario Apertura</label>
              <input
                type="time"
                value={formData.horario_apertura}
                onChange={(e) => setFormData({...formData, horario_apertura: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Horario Cierre</label>
              <input
                type="time"
                value={formData.horario_cierre}
                onChange={(e) => setFormData({...formData, horario_cierre: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Activo</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiendas.map((tienda) => (
          <div key={tienda.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">{tienda.nombre}</h3>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                tienda.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {tienda.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{tienda.descripcion}</p>
            <p className="text-sm text-gray-500 mb-1">📍 {tienda.direccion}</p>
            <p className="text-sm text-gray-500 mb-1">🏙️ {tienda.municipios?.nombre}</p>
            <p className="text-sm text-gray-500 mb-3">
              🕐 {tienda.horario_apertura} - {tienda.horario_cierre}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => editar(tienda)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => eliminar(tienda.id)}
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