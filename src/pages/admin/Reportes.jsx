import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Package, DollarSign, Users, Store, Bike, Calendar, Download } from 'lucide-react';

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    totalPedidos: 0,
    totalVentas: 0,
    pedidosPorEstado: [],
    pedidosPorMunicipio: [],
    topTiendas: [],
    topProductos: [],
    repartidoresStats: [],
    ventasPorDia: []
  });

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin]);

  async function cargarReportes() {
    try {
      setLoading(true);

      // Total de pedidos y ventas
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('total, estado, created_at, tienda_id, repartidor_id')
        .gte('created_at', fechaInicio)
        .lte('created_at', fechaFin + 'T23:59:59');

      const totalPedidos = pedidos?.length || 0;
      const totalVentas = pedidos?.reduce((sum, p) => sum + parseFloat(p.total || 0), 0) || 0;

      // Pedidos por estado
      const pedidosPorEstado = pedidos?.reduce((acc, p) => {
        const estado = p.estado;
        const existing = acc.find(item => item.estado === estado);
        if (existing) {
          existing.cantidad++;
        } else {
          acc.push({ estado, cantidad: 1 });
        }
        return acc;
      }, []) || [];

      // Top tiendas
      const tiendasCount = pedidos?.reduce((acc, p) => {
        acc[p.tienda_id] = (acc[p.tienda_id] || 0) + 1;
        return acc;
      }, {}) || {};

      const { data: tiendas } = await supabase
        .from('tiendas')
        .select('id, nombre')
        .in('id', Object.keys(tiendasCount));

      const topTiendas = Object.entries(tiendasCount)
        .map(([tienda_id, cantidad]) => ({
          nombre: tiendas?.find(t => t.id === tienda_id)?.nombre || 'Desconocida',
          cantidad
        }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Repartidores stats
      const { data: repartidores } = await supabase
        .from('repartidores')
        .select('id, total_entregas, total_ganancias, usuarios(nombre)');

      const repartidoresStats = repartidores?.map(r => ({
        nombre: r.usuarios?.nombre || 'Desconocido',
        entregas: r.total_entregas || 0,
        ganancias: r.total_ganancias || 0
      })).sort((a, b) => b.entregas - a.entregas).slice(0, 5) || [];

      // Ventas por día
      const ventasPorDia = pedidos?.reduce((acc, p) => {
        const fecha = p.created_at.split('T')[0];
        const existing = acc.find(item => item.fecha === fecha);
        if (existing) {
          existing.ventas += parseFloat(p.total || 0);
          existing.pedidos++;
        } else {
          acc.push({ fecha, ventas: parseFloat(p.total || 0), pedidos: 1 });
        }
        return acc;
      }, []).sort((a, b) => a.fecha.localeCompare(b.fecha)) || [];

      setStats({
        totalPedidos,
        totalVentas,
        pedidosPorEstado,
        topTiendas,
        repartidoresStats,
        ventasPorDia
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function exportarExcel() {
    alert('Función de exportar a Excel en desarrollo');
  }

  if (loading) {
    return <div className="p-6">Cargando reportes...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reportes y Analytics</h1>
        <button
          onClick={exportarExcel}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download className="w-5 h-5" />
          Exportar Excel
        </button>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">{stats.totalPedidos}</span>
          </div>
          <p className="text-gray-600">Total Pedidos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold">${stats.totalVentas.toLocaleString()}</span>
          </div>
          <p className="text-gray-600">Total Ventas</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Store className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold">{stats.topTiendas.length}</span>
          </div>
          <p className="text-gray-600">Tiendas Activas</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Bike className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold">{stats.repartidoresStats.length}</span>
          </div>
          <p className="text-gray-600">Repartidores</p>
        </div>
      </div>

      {/* Pedidos por estado */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pedidos por Estado</h2>
        <div className="space-y-3">
          {stats.pedidosPorEstado.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{item.estado.replace('_', ' ')}</span>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(item.cantidad / stats.totalPedidos) * 100}%` }}
                  />
                </div>
                <span className="font-semibold w-12 text-right">{item.cantidad}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tiendas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Top 5 Tiendas</h2>
        <div className="space-y-3">
          {stats.topTiendas.map((tienda, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                <span className="text-gray-700">{tienda.nombre}</span>
              </div>
              <span className="font-semibold">{tienda.cantidad} pedidos</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Repartidores */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Top 5 Repartidores</h2>
        <div className="space-y-3">
          {stats.repartidoresStats.map((rep, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                <span className="text-gray-700">{rep.nombre}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">{rep.entregas} entregas</p>
                <p className="text-sm text-gray-500">${rep.ganancias.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ventas por día */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Ventas por Día</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ventas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.ventasPorDia.map((dia, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap">{dia.fecha}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{dia.pedidos}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">${dia.ventas.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}