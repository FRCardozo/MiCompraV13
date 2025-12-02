import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function Municipios() {
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    departamento: '',
    tiene_cobertura: true,
    activo: true
  });

  useEffect(() => {
    cargarMunicipios();
  }, []);

  async function cargarMunicipios() {
    try {
      const { data, error } = await supabase
        .from('municipios')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      setMunicipios(data || []);
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
          .from('municipios')
          .update(formData)
          .eq('id', editando);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('municipios')
          .insert([formData]);
        if (error) throw error;
      }
      
      cancelar();
      cargarMunicipios();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este municipio?')) return;
    
    try {
      const { error } = await supabase
        .from('municipios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      cargarMunicipios();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  }

  function editar(municipio) {
    setEditando(municipio.id);
    setFormData({
      nombre: municipio.nombre,
      departamento: municipio.departamento,
      tiene_cobertura: municipio.tiene_cobertura,
      activo: municipio.activo
    });
    setNuevo(false);
  }

  function cancelar() {
    setEditando(null);
    setNuevo(false);
    setFormData({
      nombre: '',
      departamento: '',
      tiene_cobertura: true,
      activo: true
    });
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Municipios</h1>
        <button
          onClick={() => setNuevo(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Municipio
        </button>
      </div>

      {(nuevo || editando) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editando ? 'Editar Municipio' : 'Nuevo Municipio'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Departamento</label>
              <input
                type="text"
                value={formData.departamento}
                onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.tiene_cobertura}
                  onChange={(e) => setFormData({...formData, tiene_cobertura: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Tiene cobertura</span>
              </label>
              
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobertura</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {municipios.map((municipio) => (
              <tr key={municipio.id}>
                <td className="px-6 py-4 whitespace-nowrap">{municipio.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{municipio.departamento}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    municipio.tiene_cobertura ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {municipio.tiene_cobertura ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    municipio.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {municipio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => editar(municipio)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminar(municipio.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}