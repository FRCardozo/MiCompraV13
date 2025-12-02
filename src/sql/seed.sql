-- =====================================================
-- MICOMPRA V1 - DATOS DE PRUEBA (SEED)
-- =====================================================

-- =====================================================
-- 1. MUNICIPIOS PILOTO
-- =====================================================
INSERT INTO public.municipios (nombre, departamento, tiene_cobertura, activo) VALUES
('Sincé', 'Sucre', true, true),
('Galeras', 'Sucre', true, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. NIVELES DE REPARTIDOR
-- =====================================================
INSERT INTO public.niveles_repartidor (nombre, nivel, puede_manejar_efectivo, tope_efectivo_por_pedido, tope_efectivo_diario, puede_hacer_mandados, puede_hacer_intermunicipales, descripcion) VALUES
('Nivel 1 - Principiante', 1, false, 0, 0, false, false, 'Repartidor nuevo sin permisos de efectivo'),
('Nivel 2 - Básico', 2, true, 50000, 200000, true, false, 'Puede manejar efectivo limitado y hacer mandados locales'),
('Nivel 3 - Intermedio', 3, true, 100000, 500000, true, true, 'Puede hacer mandados intermunicipales'),
('Nivel 4 - Avanzado', 4, true, 200000, 1000000, true, true, 'Repartidor de confianza con topes altos'),
('Nivel 5 - Experto', 5, true, 500000, 2000000, true, true, 'Repartidor experto sin restricciones significativas')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CADENAS DE TIENDAS
-- =====================================================
INSERT INTO public.cadenas_tiendas (nombre, descripcion) VALUES
('D1', 'Tiendas de descuento D1'),
('Ara', 'Supermercados Ara'),
('Olímpica', 'Supermercados Olímpica'),
('Independiente', 'Tiendas independientes')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. CATEGORÍAS DE PRODUCTOS
-- =====================================================
INSERT INTO public.categorias_productos (nombre, descripcion, icono) VALUES
('Alimentos', 'Productos alimenticios', 'shopping-basket'),
('Bebidas', 'Bebidas y refrescos', 'coffee'),
('Aseo', 'Productos de aseo personal y del hogar', 'spray-can'),
('Farmacia', 'Medicamentos y productos de salud', 'pill'),
('Panadería', 'Pan y productos de panadería', 'croissant'),
('Carnes', 'Carnes y embutidos', 'beef'),
('Frutas y Verduras', 'Productos frescos', 'apple'),
('Lácteos', 'Leche, quesos y derivados', 'milk')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. TARIFAS MUNICIPALES (Sincé)
-- =====================================================
INSERT INTO public.tarifas_municipales (municipio_id, distancia_min_km, distancia_max_km, tarifa_base, tarifa_por_km, es_negociable)
SELECT 
  m.id,
  0.0,
  1.0,
  3000.00,
  0.00,
  false
FROM public.municipios m WHERE m.nombre = 'Sincé'
ON CONFLICT DO NOTHING;

INSERT INTO public.tarifas_municipales (municipio_id, distancia_min_km, distancia_max_km, tarifa_base, tarifa_por_km, es_negociable)
SELECT 
  m.id,
  1.0,
  2.5,
  5000.00,
  0.00,
  false
FROM public.municipios m WHERE m.nombre = 'Sincé'
ON CONFLICT DO NOTHING;

INSERT INTO public.tarifas_municipales (municipio_id, distancia_min_km, distancia_max_km, tarifa_base, tarifa_por_km, es_negociable)
SELECT 
  m.id,
  2.5,
  999.0,
  7000.00,
  1000.00,
  true
FROM public.municipios m WHERE m.nombre = 'Sincé'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. TARIFAS MUNICIPALES (Galeras)
-- =====================================================
INSERT INTO public.tarifas_municipales (municipio_id, distancia_min_km, distancia_max_km, tarifa_base, tarifa_por_km, es_negociable)
SELECT 
  m.id,
  0.0,
  1.0,
  2500.00,
  0.00,
  false
FROM public.municipios m WHERE m.nombre = 'Galeras'
ON CONFLICT DO NOTHING;

INSERT INTO public.tarifas_municipales (municipio_id, distancia_min_km, distancia_max_km, tarifa_base, tarifa_por_km, es_negociable)
SELECT 
  m.id,
  1.0,
  2.5,
  4500.00,
  0.00,
  false
FROM public.municipios m WHERE m.nombre = 'Galeras'
ON CONFLICT DO NOTHING;

INSERT INTO public.tarifas_municipales (municipio_id, distancia_min_km, distancia_max_km, tarifa_base, tarifa_por_km, es_negociable)
SELECT 
  m.id,
  2.5,
  999.0,
  6500.00,
  1000.00,
  true
FROM public.municipios m WHERE m.nombre = 'Galeras'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. RUTAS INTERMUNICIPALES
-- =====================================================
INSERT INTO public.rutas_intermunicipales (municipio_origen_id, municipio_destino_id, tipo_tramo, tarifa_minima, tarifa_maxima, es_negociable, distancia_km, tiempo_estimado_minutos)
SELECT 
  (SELECT id FROM public.municipios WHERE nombre = 'Sincé'),
  (SELECT id FROM public.municipios WHERE nombre = 'Galeras'),
  'directo_mototaxi',
  15000.00,
  20000.00,
  true,
  12.5,
  25
ON CONFLICT DO NOTHING;

INSERT INTO public.rutas_intermunicipales (municipio_origen_id, municipio_destino_id, tipo_tramo, tarifa_minima, tarifa_maxima, es_negociable, distancia_km, tiempo_estimado_minutos)
SELECT 
  (SELECT id FROM public.municipios WHERE nombre = 'Galeras'),
  (SELECT id FROM public.municipios WHERE nombre = 'Sincé'),
  'directo_mototaxi',
  15000.00,
  20000.00,
  true,
  12.5,
  25
ON CONFLICT DO NOTHING;

-- =====================================================
-- NOTA: Los usuarios, tiendas, productos y repartidores
-- se crearán desde el panel de administración
-- =====================================================