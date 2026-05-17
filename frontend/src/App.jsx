import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Production from './pages/Production'
import Defects from './pages/Defects'
import Warehouse from './pages/Warehouse'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Machines from './pages/Machines'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Guide from './pages/Guide'
import Calendar from './pages/Calendar'
import TrackOrder from './pages/TrackOrder'
import Quotations from './pages/Quotations'
import Deliveries from './pages/Deliveries'
import Spinner from './components/ui/Spinner'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Spinner size="lg" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="production" element={<ProtectedRoute roles={['admin','office','production']}><Production /></ProtectedRoute>} />
        <Route path="defects" element={<ProtectedRoute roles={['admin','office','production']}><Defects /></ProtectedRoute>} />
        <Route path="warehouse" element={<ProtectedRoute roles={['admin','office','warehouse']}><Warehouse /></ProtectedRoute>} />
        <Route path="quotations" element={<ProtectedRoute roles={['admin','office']}><Quotations /></ProtectedRoute>} />
        <Route path="deliveries" element={<ProtectedRoute roles={['admin','office']}><Deliveries /></ProtectedRoute>} />
        <Route path="clients" element={<ProtectedRoute roles={['admin','office']}><Clients /></ProtectedRoute>} />
        <Route path="clients/:id" element={<ProtectedRoute roles={['admin','office']}><ClientDetail /></ProtectedRoute>} />
        <Route path="machines" element={<ProtectedRoute roles={['admin','production']}><Machines /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={['admin','office']}><Reports /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
        <Route path="calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      </Route>
      <Route path="/track/:token" element={<TrackOrder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
