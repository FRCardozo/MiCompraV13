// src/pages/cliente/ClienteHome.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

import {
  Store,
  Search,
  Package,
  MapPin,
  ShoppingCart,
  Star,
  Clock,
  Zap,
  Bike,
  ShoppingBag,
  Tag,
} from 'lucide-react';

export default function ClienteHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile?.municipio_id) {
      loadTiendas();
    } else {
      setLoading(false);
    }
  }, [profile]);

  async function loadTiendas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tiendas')
        .select(
          `
          *,
          municipios (nombre),
          cadenas_tiendas (nombre, logo_url)
        `
        )
        .eq('municipio_id', profile?.municipio_id)
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      setTiendas(data || []);
    } catch (error) {
      console.error('Error cargando tiendas:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTiendas = tiendas.filter((tienda) =>
    tienda.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // pt-16 para dejar espacio al Navbar fijo
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 pb-24">
        {/* CABECERA TIPO APP */}
        <section className="pt-3 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                Bienvenido de nuevo
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900">
                ¡Hola, {profile?.nombre || 'cliente'}!
              </h1>
            </div>

            {/* Chip de municipio */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700">
              <MapPin className="w-3 h-3 text-blue-500" />
              <span className="truncate max-w-[120px]">
                {profile?.municipios?.nombre || 'Selecciona tu municipio'}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            ¿Qué quieres pedir hoy? Mercado, encargos rápidos o tus tiendas favoritas.
          </p>
        </section>

        {/* BUSCADOR */}
        <section className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tiendas, productos o categorías..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500"
            />
          </div>
        </section>

        {/* BANNER PRINCIPAL */}
        <section className="mb-5">
          <div className="w-full rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white p-4 sm:p-5 shadow-lg flex items-center">
            <div className="flex-1">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">Envío rápido</span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold leading-snug">
                Recibe tu pedido en menos de 30 minutos
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-blue-100">
                Tiendas cercanas, mandados y encargos a donde estés.
              </p>
            </div>

            <div className="hidden sm:flex items-center justify-center ml-4">
              <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Package className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* ACCESOS RÁPIDOS – CARDS HORIZONTALES TIPO APP */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Explora rápido</h3>
            <span className="text-[11px] text-slate-400">Desliza para ver más</span>
          </div>

          <div className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-1">
            {/* Card Tiendas */}
            <button
              className="min-w-[110px] rounded-2xl bg-white border border-slate-100 shadow-sm px-3 py-3 flex flex-col items-start gap-2 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Tiendas</p>
                <p className="text-[11px] text-slate-500">Super, abarrotes, mercado</p>
              </div>
            </button>

            {/* Card Mandados */}
            <button
              className="min-w-[110px] rounded-2xl bg-white border border-slate-100 shadow-sm px-3 py-3 flex flex-col items-start gap-2 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Bike className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Mandados</p>
                <p className="text-[11px] text-slate-500">Encargos personalizados</p>
              </div>
            </button>

            {/* Card Populares */}
            <button
              className="min-w-[110px] rounded-2xl bg-white border border-slate-100 shadow-sm px-3 py-3 flex flex-col items-start gap-2 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Populares</p>
                <p className="text-[11px] text-slate-500">Lo que más se pide</p>
              </div>
            </button>

            {/* Card Ofertas */}
            <button
              className="min-w-[110px] rounded-2xl bg-white border border-slate-100 shadow-sm px-3 py-3 flex flex-col items-start gap-2 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Ofertas</p>
                <p className="text-[11px] text-slate-500">Descuentos y promos</p>
              </div>
            </button>
          </div>
        </section>

        {/* LISTA DE TIENDAS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Tiendas cerca de ti
            </h2>
            <span className="text-xs text-slate-500">
              {filteredTiendas.length} disponibles
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-sm text-slate-500">
                Cargando tiendas en tu zona...
              </p>
            </div>
          ) : filteredTiendas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-10 px-6 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                <Store className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-800 mb-1">
                Aún no tenemos tiendas aquí
              </p>
              <p className="text-sm text-slate-500">
                Pronto estaremos sumando aliados en tu municipio. Vuelve más tarde
                o cambia tu ubicación.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTiendas.map((tienda) => (
                <button
                  key={tienda.id}
                  onClick={() => navigate(`/cliente/tienda/${tienda.id}`)}
                  className="text-left rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden active:scale-[0.99] transition-transform"
                >
                  {/* Imagen / banner */}
                  <div className="relative h-28 bg-slate-100">
                    {tienda.banner_url && (
                      <img
                        src={tienda.banner_url}
                        alt={tienda.nombre}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] text-white font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Abierto</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-3.5 pt-2.5 pb-3">
                    <div className="flex items-start gap-3 mb-2">
                      {tienda.logo_url ? (
                        <img
                          src={tienda.logo_url}
                          alt={tienda.nombre}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                          <Store className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {tienda.nombre}
                        </p>
                        {tienda.cadenas_tiendas && (
                          <p className="text-[11px] text-slate-500">
                            {tienda.cadenas_tiendas.nombre}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">
                          {tienda.direccion}
                        </span>
                      </div>
                      {tienda.horario_apertura && tienda.horario_cierre && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {tienda.horario_apertura} - {tienda.horario_cierre}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-slate-900">
                          4.8
                        </span>
                        <span>• 200+ pedidos</span>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/30">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Ver productos</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
