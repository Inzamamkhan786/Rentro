import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Dashboard from './pages/Dashboard';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import Documents from './pages/Documents';
import Verifications from './pages/Verifications';
import ProviderEarnings from './pages/ProviderEarnings';
import Support from './pages/Support';
import AdminSupport from './pages/AdminSupport';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/vehicles" element={<Vehicles />} />
      <Route path="/vehicles/:id" element={<VehicleDetail />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/add-vehicle" element={<ProtectedRoute roles={['provider', 'admin']}><AddVehicle /></ProtectedRoute>} />
      <Route path="/dashboard/edit-vehicle/:id" element={<ProtectedRoute roles={['provider', 'admin']}><EditVehicle /></ProtectedRoute>} />
      <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/dashboard/earnings" element={<ProtectedRoute roles={['provider', 'admin']}><ProviderEarnings /></ProtectedRoute>} />
      <Route path="/dashboard/verifications" element={<ProtectedRoute roles={['admin']}><Verifications /></ProtectedRoute>} />
      <Route path="/dashboard/support" element={<ProtectedRoute roles={['admin']}><AdminSupport /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
