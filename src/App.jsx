import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cuentas from './pages/Cuentas';
import Prestamos from './pages/Prestamos';
import PagoCredito from './pages/PagoCredito';
import SolicitarPrestamo from './pages/SolicitarPrestamo';
import CronogramaCuotas from './pages/CronogramaCuotas';
import Home from './pages/Home';

export default function App() {
  // Middleware de validación local rápido para rutas del portal
  const AuthGuard = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />

      {/* Rutas Protegidas del Homebanking (Conectadas a FastAPI) */}
      <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/dashboard/cuentas" element={<AuthGuard><Cuentas /></AuthGuard>} />
      <Route path="/dashboard/prestamos" element={<AuthGuard><Prestamos /></AuthGuard>} />
      <Route path="/dashboard/pagos" element={<AuthGuard><PagoCredito /></AuthGuard>} />
      <Route path="/dashboard/solicitar" element={<AuthGuard><SolicitarPrestamo /></AuthGuard>} />
      <Route path="/dashboard/cronograma/:id_prestamo" element={<AuthGuard><CronogramaCuotas /></AuthGuard>} />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}