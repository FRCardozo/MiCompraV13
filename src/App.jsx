// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RegistroTienda from './pages/RegistroTienda';
import RegistroRepartidor from './pages/RegistroRepartidor';
import ClienteHome from './pages/cliente/ClienteHome';
import TiendaDetalle from './pages/cliente/TiendaDetalle';
import Checkout from './pages/cliente/Checkout';
import PedidoConfirmado from './pages/cliente/PedidoConfirmado';
import MisPedidos from './pages/cliente/MisPedidos';
import TiendaHome from './pages/tienda/TiendaHome';
import PedidosTienda from './pages/tienda/PedidosTienda';
import MisRepartidores from './pages/tienda/MisRepartidores';   // 👈 NUEVO
import RepartidorHome from './pages/repartidor/RepartidorHome';
import PedidosDisponibles from './pages/repartidor/PedidosDisponibles';
import MisEntregas from './pages/repartidor/MisEntregas';
import AdminHome from './pages/admin/AdminHome';
import Municipios from './pages/admin/Municipios';
import GestionTiendas from './pages/admin/GestionTiendas';
import GestionRepartidores from './pages/admin/GestionRepartidores';
import Reportes from './pages/admin/Reportes';
import GPSTracking from './pages/admin/GPSTracking';
import GestionRetiros from './pages/admin/GestionRetiros';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/registro-tienda" element={<RegistroTienda />} />
            <Route path="/registro-repartidor" element={<RegistroRepartidor />} />

            <Route element={<Layout />}>
              {/* Rutas Cliente */}
              <Route
                path="/cliente"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <ClienteHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/home"
                element={<Navigate to="/cliente" replace />}
              />
              <Route
                path="/cliente/tienda/:id"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <TiendaDetalle />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/checkout"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/pedido-confirmado"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <PedidoConfirmado />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/mis-pedidos"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <MisPedidos />
                  </ProtectedRoute>
                }
              />

              {/* Rutas Tienda */}
              <Route
                path="/tienda"
                element={
                  <ProtectedRoute allowedRoles={['tienda']}>
                    <TiendaHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tienda/home"
                element={<Navigate to="/tienda" replace />}
              />
              <Route
                path="/tienda/pedidos"
                element={
                  <ProtectedRoute allowedRoles={['tienda']}>
                    <PedidosTienda />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tienda/repartidores"           // 👈 NUEVA RUTA
                element={
                  <ProtectedRoute allowedRoles={['tienda']}>
                    <MisRepartidores />
                  </ProtectedRoute>
                }
              />

              {/* Rutas Repartidor */}
              <Route
                path="/repartidor"
                element={
                  <ProtectedRoute allowedRoles={['repartidor']}>
                    <RepartidorHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repartidor/home"
                element={<Navigate to="/repartidor" replace />}
              />
              <Route
                path="/repartidor/disponibles"
                element={
                  <ProtectedRoute allowedRoles={['repartidor']}>
                    <PedidosDisponibles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repartidor/entregas"
                element={
                  <ProtectedRoute allowedRoles={['repartidor']}>
                    <MisEntregas />
                  </ProtectedRoute>
                }
              />

              {/* Rutas Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/home"
                element={<Navigate to="/admin" replace />}
              />
              <Route
                path="/admin/municipios"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Municipios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tiendas"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <GestionTiendas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/repartidores"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <GestionRepartidores />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reportes"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Reportes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/gps"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <GPSTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/retiros"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <GestionRetiros />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
