import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Spinner from './components/ui/Spinner'

// Pages are loaded on demand so the first screen opens fast (the app used to ship as one 900 KB file)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Production = lazy(() => import('./pages/Production'))
const Defects = lazy(() => import('./pages/Defects'))
const Warehouse = lazy(() => import('./pages/Warehouse'))
const Clients = lazy(() => import('./pages/Clients'))
const ClientDetail = lazy(() => import('./pages/ClientDetail'))
const Machines = lazy(() => import('./pages/Machines'))
const Reports = lazy(() => import('./pages/Reports'))
const Users = lazy(() => import('./pages/Users'))
const Profile = lazy(() => import('./pages/Profile'))
const Guide = lazy(() => import('./pages/Guide'))
const Calendar = lazy(() => import('./pages/Calendar'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const Quotations = lazy(() => import('./pages/Quotations'))
const Deliveries = lazy(() => import('./pages/Deliveries'))
const Suppliers = lazy(() => import('./pages/Suppliers'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Settings = lazy(() => import('./pages/Settings'))
const Board = lazy(() => import('./pages/Board'))
const Catalog = lazy(() => import('./pages/Catalog'))

const PageFallback = () => (
  <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
)

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
    <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="board" element={<ProtectedRoute roles={['admin','office']}><Board /></ProtectedRoute>} />
        <Route path="orders" element={<Orders />} />
        <Route path="catalog" element={<ProtectedRoute roles={['admin','office']}><Catalog /></ProtectedRoute>} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="production" element={<ProtectedRoute roles={['admin','office','production']}><Production /></ProtectedRoute>} />
        <Route path="defects" element={<ProtectedRoute roles={['admin','office','production']}><Defects /></ProtectedRoute>} />
        <Route path="warehouse" element={<ProtectedRoute roles={['admin','office','warehouse']}><Warehouse /></ProtectedRoute>} />
        <Route path="quotations" element={<ProtectedRoute roles={['admin','office']}><Quotations /></ProtectedRoute>} />
        <Route path="deliveries" element={<ProtectedRoute roles={['admin','office','warehouse']}><Deliveries /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute roles={['admin','office','warehouse']}><Suppliers /></ProtectedRoute>} />
        <Route path="clients" element={<ProtectedRoute roles={['admin','office']}><Clients /></ProtectedRoute>} />
        <Route path="clients/:id" element={<ProtectedRoute roles={['admin','office']}><ClientDetail /></ProtectedRoute>} />
        <Route path="machines" element={<ProtectedRoute roles={['admin','production']}><Machines /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={['admin','office']}><Reports /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
        <Route path="calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      </Route>
      <Route path="/track/:token" element={<TrackOrder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
