# MiCompra V1 - Plataforma de Pedidos y Entregas

## 📋 Descripción

MiCompra es una plataforma completa de pedidos y entregas para los municipios de Sincé y Galeras (Sucre, Colombia). Conecta clientes, tiendas y repartidores en un ecosistema digital eficiente.

## 🚀 Características Principales

### ✅ COMPLETAMENTE IMPLEMENTADO

#### 1. **Sistema de Autenticación**
- Registro y login con Supabase Auth
- Gestión de sesiones
- Rutas protegidas por rol
- 4 tipos de usuario: Cliente, Tienda, Repartidor, Admin

#### 2. **Flujo Completo de Pedidos (Cliente → Tienda → Repartidor)**
- **Cliente:**
  - Explorar tiendas por municipio
  - Ver catálogo de productos
  - Carrito de compras
  - Checkout con dirección y método de pago
  - Seguimiento de pedidos en tiempo real
  - Historial completo

- **Tienda:**
  - Dashboard con estadísticas
  - Gestión de pedidos (aceptar, preparar, marcar listo)
  - Filtros por estado
  - Notificaciones automáticas

- **Repartidor:**
  - Dashboard con wallet
  - Ver pedidos disponibles
  - Aceptar pedidos
  - Gestionar entregas activas
  - Marcar como entregado
  - Wallet se actualiza automáticamente

#### 3. **Panel de Administración Completo**
- **Gestión de Municipios:** CRUD completo
- **Gestión de Tiendas:** Crear, editar, desactivar
- **Gestión de Repartidores:** Niveles, vehículos, disponibilidad
- **Reportes y Analytics:**
  - Total de pedidos y ventas
  - Pedidos por estado
  - Top tiendas
  - Top repartidores
  - Ventas por día
  - Filtros por fecha
  - Exportar a Excel (preparado)
- **GPS Tracking:** Seguimiento en tiempo real de repartidores
- **Gestión de Retiros:** Aprobar/rechazar solicitudes de retiro

#### 4. **Notificaciones en Tiempo Real**
- Supabase Realtime para actualizaciones instantáneas
- Notificaciones internas en la plataforma
- Service Worker para PWA
- Push Notifications (estructura lista)

#### 5. **Base de Datos Completa**
- 18 tablas relacionadas
- Índices optimizados
- Datos de prueba (seed)
- Municipios: Sincé y Galeras
- Niveles de repartidor (1-5)
- Cadenas de tiendas
- Categorías de productos

## 🛠️ Stack Tecnológico

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Geolocalización:** PostGIS (preparado para Leaflet + OpenStreetMap)
- **PWA:** Service Worker + Manifest
- **Notificaciones:** Supabase Realtime + Push API
- **Iconos:** Lucide React

## 📦 Estructura del Proyecto

```
/
├── components/
│   ├── Layout.js
│   ├── Navbar.js
│   └── ProtectedRoute.js
├── context/
│   └── AuthContext.js
├── pages/
│   ├── cliente/
│   │   ├── ClienteHome.js
│   │   ├── TiendaDetalle.js
│   │   ├── Checkout.js
│   │   ├── PedidoConfirmado.js
│   │   └── MisPedidos.js
│   ├── tienda/
│   │   ├── TiendaHome.js
│   │   └── PedidosTienda.js
│   ├── repartidor/
│   │   ├── RepartidorHome.js
│   │   ├── PedidosDisponibles.js
│   │   └── MisEntregas.js
│   ├── admin/
│   │   ├── AdminHome.js
│   │   ├── Municipios.js
│   │   ├── GestionTiendas.js
│   │   ├── GestionRepartidores.js
│   │   ├── Reportes.js
│   │   ├── GPSTracking.js
│   │   └── GestionRetiros.js
│   ├── Login.js
│   └── Registro.js
├── lib/
│   └── supabase.js
├── sql/
│   ├── schema.sql
│   └── seed.sql
├── utils/
│   └── notifications.js
├── public/
│   ├── service-worker.js
│   └── manifest.json
├── App.js
└── index.js
```

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

1. **municipios** - Municipios con cobertura
2. **usuarios** - Todos los usuarios del sistema
3. **wallets** - Billeteras de repartidores
4. **niveles_repartidor** - Niveles 1-5 con permisos
5. **repartidores** - Datos de repartidores
6. **cadenas_tiendas** - D1, Ara, Olímpica, etc.
7. **tiendas** - Tiendas registradas
8. **categorias_productos** - Categorías de productos
9. **productos** - Catálogo de productos
10. **tarifas_municipales** - Tarifas de envío
11. **rutas_intermunicipales** - Rutas entre municipios
12. **pedidos** - Pedidos de tienda
13. **items_pedido** - Items de cada pedido
14. **mandados** - Mandados personalizados
15. **transacciones_wallet** - Historial de transacciones
16. **solicitudes_retiro** - Solicitudes de retiro
17. **notificaciones** - Notificaciones del sistema
18. **busquedas_clientes** - Analytics de búsquedas

## 🚦 Flujo de Pedidos

```
1. CLIENTE crea pedido
   ↓
2. TIENDA recibe notificación
   ↓
3. TIENDA acepta y prepara
   ↓
4. TIENDA marca como "listo para recoger"
   ↓
5. REPARTIDOR ve pedido disponible
   ↓
6. REPARTIDOR acepta pedido
   ↓
7. REPARTIDOR marca como "entregado"
   ↓
8. WALLET del repartidor se actualiza automáticamente
   ↓
9. CLIENTE recibe notificación de entrega
```

## 📱 PWA (Progressive Web App)

La aplicación está lista para ser instalada como PWA:

- ✅ Service Worker configurado
- ✅ Manifest.json completo
- ✅ Funciona offline (caché básico)
- ✅ Push Notifications (estructura lista)
- ✅ Instalable en móviles

## 🔔 Sistema de Notificaciones

### Notificaciones Internas (Supabase Realtime)
- ✅ Nuevo pedido para tienda
- ✅ Pedido aceptado
- ✅ Pedido listo para recoger
- ✅ Repartidor asignado
- ✅ Pedido en camino
- ✅ Pedido entregado

### Push Notifications (Preparado)
- Service Worker configurado
- Utilidades de notificaciones creadas
- Requiere configurar VAPID keys (Firebase/OneSignal)

## 📍 GPS Tracking

### Implementado:
- ✅ Estructura de base de datos (ubicacion_actual, ultima_ubicacion_at)
- ✅ Interfaz de tracking en admin
- ✅ Supabase Realtime para actualizaciones
- ✅ Lista de repartidores activos

### Por implementar:
- Integración con Leaflet + OpenStreetMap
- Actualización de ubicación desde app móvil
- Visualización de rutas en mapa

**Instalación:**
```bash
npm install leaflet react-leaflet
```

## 🔐 Roles y Permisos

### Cliente
- Ver tiendas y productos
- Crear pedidos
- Ver historial de pedidos
- Recibir notificaciones

### Tienda
- Ver pedidos recibidos
- Aceptar/rechazar pedidos
- Actualizar estados
- Ver estadísticas

### Repartidor
- Ver pedidos disponibles
- Aceptar pedidos
- Marcar entregas
- Ver wallet
- Solicitar retiros

### Admin
- Gestión completa de municipios
- Gestión completa de tiendas
- Gestión completa de repartidores
- Ver reportes y analytics
- GPS tracking
- Aprobar retiros

## 🧪 Datos de Prueba

### Municipios
- Sincé, Sucre
- Galeras, Sucre

### Niveles de Repartidor
- Nivel 1: Principiante (sin efectivo)
- Nivel 2: Básico (hasta $50,000)
- Nivel 3: Intermedio (hasta $100,000)
- Nivel 4: Avanzado (hasta $200,000)
- Nivel 5: Experto (hasta $500,000)

### Cadenas de Tiendas
- D1
- Ara
- Olímpica
- Independiente

### Categorías de Productos
- Alimentos
- Bebidas
- Aseo
- Farmacia
- Panadería
- Carnes
- Frutas y Verduras
- Lácteos

## 🚀 Cómo Probar

### 1. Crear Usuario Cliente
1. Ir a /registro
2. Completar formulario
3. Se crea automáticamente como cliente

### 2. Crear Usuario Tienda (desde Supabase)
```sql
-- Crear usuario tienda
UPDATE usuarios 
SET tipo_usuario = 'tienda' 
WHERE email = 'tienda@test.com';

-- Crear registro en tiendas
INSERT INTO tiendas (usuario_id, nombre, direccion, municipio_id, activo)
VALUES (
  (SELECT id FROM usuarios WHERE email = 'tienda@test.com'),
  'Tienda de Prueba',
  'Calle Principal #123',
  (SELECT id FROM municipios WHERE nombre = 'Sincé'),
  true
);
```

### 3. Crear Usuario Repartidor (desde Supabase)
```sql
-- Crear usuario repartidor
UPDATE usuarios 
SET tipo_usuario = 'repartidor' 
WHERE email = 'repartidor@test.com';

-- Crear wallet
INSERT INTO wallets (usuario_id)
VALUES ((SELECT id FROM usuarios WHERE email = 'repartidor@test.com'));

-- Crear registro en repartidores
INSERT INTO repartidores (usuario_id, nivel_id, medio_transporte, disponible)
VALUES (
  (SELECT id FROM usuarios WHERE email = 'repartidor@test.com'),
  (SELECT id FROM niveles_repartidor WHERE nivel = 2),
  'Moto',
  true
);
```

### 4. Crear Usuario Admin (desde Supabase)
```sql
UPDATE usuarios 
SET tipo_usuario = 'admin' 
WHERE email = 'admin@test.com';
```

## 📊 Estado del Proyecto

| Módulo | Estado | Progreso |
|--------|--------|----------|
| Base de datos | ✅ Completo | 100% |
| Autenticación | ✅ Completo | 100% |
| Cliente - Explorar tiendas | ✅ Completo | 100% |
| Cliente - Ver productos | ✅ Completo | 100% |
| Cliente - Carrito | ✅ Completo | 100% |
| Cliente - Checkout | ✅ Completo | 100% |
| Cliente - Mis pedidos | ✅ Completo | 100% |
| Tienda - Dashboard | ✅ Completo | 100% |
| Tienda - Gestión pedidos | ✅ Completo | 100% |
| Repartidor - Dashboard | ✅ Completo | 100% |
| Repartidor - Pedidos disponibles | ✅ Completo | 100% |
| Repartidor - Mis entregas | ✅ Completo | 100% |
| Repartidor - Wallet | ✅ Completo | 100% |
| Admin - Dashboard | ✅ Completo | 100% |
| Admin - Municipios | ✅ Completo | 100% |
| Admin - Tiendas | ✅ Completo | 100% |
| Admin - Repartidores | ✅ Completo | 100% |
| Admin - Reportes | ✅ Completo | 100% |
| Admin - GPS Tracking | ✅ Estructura | 90% |
| Admin - Retiros | ✅ Completo | 100% |
| Notificaciones Realtime | ✅ Completo | 100% |
| Push Notifications (PWA) | ✅ Estructura | 80% |

## 🔧 Próximas Mejoras

1. **GPS Tracking Completo:**
   - Instalar Leaflet
   - Implementar mapa interactivo
   - Actualización de ubicación desde móvil

2. **Push Notifications:**
   - Configurar Firebase/OneSignal
   - Implementar VAPID keys
   - Envío de notificaciones push

3. **Mandados Personalizados:**
   - UI completa para mandados
   - Flujo de negociación de tarifa
   - Tracking específico

4. **Mejoras de UX:**
   - Animaciones con Framer Motion
   - Skeleton loaders
   - Optimistic UI updates

5. **Analytics Avanzados:**
   - Gráficas con Chart.js
   - Exportar reportes a Excel
   - Dashboard de métricas en tiempo real

## 📝 Notas Importantes

- **RLS Deshabilitado:** Para desarrollo, Row Level Security está deshabilitado. Habilitar en producción.
- **Wallet Automático:** Se crea automáticamente al crear un repartidor.
- **Notificaciones:** Funcionan en tiempo real con Supabase Realtime.
- **GPS:** Estructura lista, requiere integración con Leaflet.
- **PWA:** Funcional, requiere HTTPS en producción.

## 🤝 Contribuir

Este es un proyecto privado para los municipios de Sincé y Galeras.

## 📄 Licencia

Propietario: MiCompra V1
Todos los derechos reservados.

---

**Desarrollado con ❤️ para Sincé y Galeras**