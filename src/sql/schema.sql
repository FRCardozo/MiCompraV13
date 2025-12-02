-- =====================================================
-- MICOMPRA V1 - ESQUEMA SQL COMPLETO
-- =====================================================
-- Este archivo contiene el esquema completo de la base de datos
-- para la plataforma MiCompra (tipo Rappi/Uber Eats)
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- 1. TABLA: municipios
-- Almacena los municipios donde opera la plataforma
-- =====================================================
CREATE TABLE IF NOT EXISTS public.municipios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  tiene_cobertura BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA: usuarios (espejo de auth.users)
-- Perfil extendido de todos los usuarios del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('cliente', 'tienda', 'repartidor', 'admin')),
  municipio_id UUID REFERENCES public.municipios(id),
  activo BOOLEAN DEFAULT true,
  bloqueado BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA: wallets
-- Billetera digital de cada usuario (principalmente repartidores)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE UNIQUE,
  saldo DECIMAL(12,2) DEFAULT 0.00,
  saldo_pendiente DECIMAL(12,2) DEFAULT 0.00,
  saldo_disponible DECIMAL(12,2) DEFAULT 0.00,
  total_recargado DECIMAL(12,2) DEFAULT 0.00,
  total_retirado DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA: niveles_repartidor
-- Define los niveles de confianza y permisos de repartidores
-- =====================================================
CREATE TABLE IF NOT EXISTS public.niveles_repartidor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(50) NOT NULL,
  nivel INTEGER NOT NULL UNIQUE,
  puede_manejar_efectivo BOOLEAN DEFAULT false,
  tope_efectivo_por_pedido DECIMAL(10,2) DEFAULT 0.00,
  tope_efectivo_diario DECIMAL(10,2) DEFAULT 0.00,
  puede_hacer_mandados BOOLEAN DEFAULT false,
  puede_hacer_intermunicipales BOOLEAN DEFAULT false,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TABLA: repartidores
-- Información específica de los repartidores
-- =====================================================
CREATE TABLE IF NOT EXISTS public.repartidores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE UNIQUE,
  nivel_id UUID REFERENCES public.niveles_repartidor(id),
  medio_transporte VARCHAR(50),
  placa VARCHAR(20),
  total_entregas INTEGER DEFAULT 0,
  total_ganancias DECIMAL(12,2) DEFAULT 0.00,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
  disponible BOOLEAN DEFAULT true,
  ubicacion_actual GEOGRAPHY(POINT, 4326),
  ultima_ubicacion_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA: cadenas_tiendas
-- Cadenas comerciales (D1, Ara, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cadenas_tiendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  logo_url TEXT,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA: tiendas
-- Tiendas aliadas a la plataforma
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tiendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE UNIQUE,
  cadena_id UUID REFERENCES public.cadenas_tiendas(id),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  direccion TEXT NOT NULL,
  municipio_id UUID NOT NULL REFERENCES public.municipios(id),
  ubicacion GEOGRAPHY(POINT, 4326),
  telefono VARCHAR(20),
  horario_apertura TIME,
  horario_cierre TIME,
  modo_cobro VARCHAR(20) DEFAULT 'comision' CHECK (modo_cobro IN ('comision', 'suscripcion', 'gratis')),
  porcentaje_comision DECIMAL(5,2) DEFAULT 0.00,
  plan_suscripcion VARCHAR(50),
  tiene_repartidores_propios BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. TABLA: categorias_productos
-- Categorías de productos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categorias_productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. TABLA: productos
-- Catálogo de productos por tienda
-- =====================================================
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias_productos(id),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  precio_oferta DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. TABLA: tarifas_municipales
-- Tarifas de envío dentro de cada municipio
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tarifas_municipales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES public.municipios(id),
  distancia_min_km DECIMAL(5,2) NOT NULL,
  distancia_max_km DECIMAL(5,2) NOT NULL,
  tarifa_base DECIMAL(10,2) NOT NULL,
  tarifa_por_km DECIMAL(10,2) DEFAULT 0.00,
  es_negociable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. TABLA: rutas_intermunicipales
-- Rutas y tarifas entre municipios
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rutas_intermunicipales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_origen_id UUID NOT NULL REFERENCES public.municipios(id),
  municipio_destino_id UUID NOT NULL REFERENCES public.municipios(id),
  tipo_tramo VARCHAR(50) NOT NULL,
  tarifa_minima DECIMAL(10,2) NOT NULL,
  tarifa_maxima DECIMAL(10,2) NOT NULL,
  es_negociable BOOLEAN DEFAULT false,
  distancia_km DECIMAL(6,2),
  tiempo_estimado_minutos INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. TABLA: pedidos
-- Pedidos de productos de tiendas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_pedido VARCHAR(20) UNIQUE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.usuarios(id),
  tienda_id UUID NOT NULL REFERENCES public.tiendas(id),
  repartidor_id UUID REFERENCES public.repartidores(id),
  estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptado', 'preparando', 'listo_recoger', 'en_camino', 'entregado', 'cancelado')),
  subtotal DECIMAL(10,2) NOT NULL,
  costo_envio DECIMAL(10,2) DEFAULT 0.00,
  tarifa_envio_final DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  tipo_pago VARCHAR(20) DEFAULT 'efectivo' CHECK (tipo_pago IN ('efectivo', 'transferencia', 'tarjeta')),
  pago_confirmado BOOLEAN DEFAULT false,
  direccion_entrega TEXT NOT NULL,
  ubicacion_entrega GEOGRAPHY(POINT, 4326),
  distancia_km DECIMAL(5,2),
  notas TEXT,
  tiempo_estimado_minutos INTEGER,
  fecha_aceptado TIMESTAMPTZ,
  fecha_listo TIMESTAMPTZ,
  fecha_en_camino TIMESTAMPTZ,
  fecha_entregado TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. TABLA: items_pedido
-- Items individuales de cada pedido
-- =====================================================
CREATE TABLE IF NOT EXISTS public.items_pedido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. TABLA: mandados
-- Mandados personalizados (encargos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mandados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_mandado VARCHAR(20) UNIQUE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.usuarios(id),
  repartidor_id UUID REFERENCES public.repartidores(id),
  estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptado', 'en_recogida', 'recogido', 'en_entrega', 'entregado', 'cancelado')),
  descripcion TEXT NOT NULL,
  direccion_recogida TEXT NOT NULL,
  direccion_entrega TEXT NOT NULL,
  ubicacion_recogida GEOGRAPHY(POINT, 4326),
  ubicacion_entrega GEOGRAPHY(POINT, 4326),
  distancia_km DECIMAL(5,2),
  tarifa_base DECIMAL(10,2) NOT NULL,
  tarifa_final DECIMAL(10,2),
  tipo_pago VARCHAR(20) DEFAULT 'efectivo' CHECK (tipo_pago IN ('efectivo', 'transferencia')),
  pago_confirmado BOOLEAN DEFAULT false,
  notas TEXT,
  tiempo_estimado_minutos INTEGER,
  fecha_aceptado TIMESTAMPTZ,
  fecha_entregado TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. TABLA: transacciones_wallet
-- Registro de todas las transacciones de wallet
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transacciones_wallet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('ingreso_pedido', 'ingreso_mandado', 'retiro', 'reembolso', 'ajuste')),
  monto DECIMAL(12,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
  referencia_pedido_id UUID REFERENCES public.pedidos(id),
  referencia_mandado_id UUID REFERENCES public.mandados(id),
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. TABLA: solicitudes_retiro
-- Solicitudes de retiro de repartidores
-- =====================================================
CREATE TABLE IF NOT EXISTS public.solicitudes_retiro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repartidor_id UUID NOT NULL REFERENCES public.repartidores(id),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id),
  monto DECIMAL(12,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'pagado')),
  metodo_pago VARCHAR(50),
  datos_pago JSONB,
  notas_admin TEXT,
  fecha_aprobado TIMESTAMPTZ,
  fecha_pagado TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. TABLA: notificaciones
-- Sistema de notificaciones en tiempo real
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  referencia_pedido_id UUID REFERENCES public.pedidos(id),
  referencia_mandado_id UUID REFERENCES public.mandados(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 18. TABLA: busquedas_clientes
-- Registro de búsquedas para analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS public.busquedas_clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES public.usuarios(id),
  termino_busqueda VARCHAR(255) NOT NULL,
  tipo_busqueda VARCHAR(50),
  resultados_encontrados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON public.usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_municipio ON public.usuarios(municipio_id);
CREATE INDEX IF NOT EXISTS idx_repartidores_disponible ON public.repartidores(disponible);
CREATE INDEX IF NOT EXISTS idx_tiendas_municipio ON public.tiendas(municipio_id);
CREATE INDEX IF NOT EXISTS idx_tiendas_activo ON public.tiendas(activo);
CREATE INDEX IF NOT EXISTS idx_productos_tienda ON public.productos(tienda_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON public.pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_tienda ON public.pedidos(tienda_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_repartidor ON public.pedidos(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_mandados_cliente ON public.mandados(cliente_id);
CREATE INDEX IF NOT EXISTS idx_mandados_repartidor ON public.mandados(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_mandados_estado ON public.mandados(estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON public.notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON public.notificaciones(leida);