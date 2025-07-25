import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

import NewOperationPage from './pages/NewOperationPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Gestiones from './pages/Gestiones';
import { Icon } from './components/Icon';

// --- CONFIGURACIÓN CENTRALIZADA DE ROLES ---
// Aquí puedes agregar o quitar correos fácilmente para asignar roles.
const ROLES = {
    ADMIN: [
        'kevin.tupac@capitalexpress.cl',
        'kevin.gianecchine@capitalexpress.cl',
    ],
    GESTION: [
        'ana.gestion@capitalexpress.cl',      // Correo de ejemplo
        'pedro.riesgos@capitalexpress.pe',    // Correo de ejemplo
        'carla.verificacion@capitalexpress.cl'// Correo de ejemplo
    ]
    // El rol 'VENTAS' es el rol por defecto para cualquier otro usuario autenticado.
};

/**
 * Determina el rol de un usuario basado en su email.
 * @param {object} user - El objeto de usuario de Firebase.
 * @returns {string|null} - Devuelve 'admin', 'gestion', 'ventas', o null si no hay usuario.
 */
const getRoleForUser = (user) => {
    if (!user || !user.email) return null;

    if (ROLES.ADMIN.includes(user.email)) {
        return 'admin';
    }
    if (ROLES.GESTION.includes(user.email)) {
        return 'gestion';
    }
    return 'ventas'; // Rol por defecto
};


// --- COMPONENTES DE UI ---
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <Icon name="Loader" className="animate-spin text-blue-600" size={48} />
    </div>
);

const ProtectedRoute = ({ user, children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
};

const NavigationHeader = ({ user, handleLogout }) => (
    <header className="flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Capital Express" className="h-10" />
            <nav className="flex gap-4">
                <Link to="/dashboard" className="font-semibold text-gray-600 hover:text-blue-600">Ventas</Link>
                <Link to="/gestion" className="font-semibold text-gray-600 hover:text-blue-600">Gestión</Link>
            </nav>
        </div>
        <div className='flex items-center gap-2'>
          <p className='text-sm text-gray-600'>Bienvenido, <b>{user.displayName.split(' ')[0]}</b></p>
          <button onClick={handleLogout} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm flex items-center gap-2">
              <Icon name="LogOut" size={16} /> Cerrar Sesión
          </button>
        </div>
    </header>
);

// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
const AppContent = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const role = getRoleForUser(currentUser);
        setUser(currentUser);
        setUserRole(role);
        
        const currentPath = window.location.pathname;
        if(currentPath === '/login' || currentPath === '/'){
            // Redirige al panel principal según el rol
            if(role === 'admin' || role === 'gestion'){
                navigate('/gestion');
            } else {
                navigate('/dashboard');
            }
        }
      } else {
        setUser(null);
        setUserRole(null);
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Definición de permisos de una manera clara
  const isAdmin = userRole === 'admin';
  const canAccessVentas = user && (userRole === 'ventas' || isAdmin);
  const canAccessGestion = user && (userRole === 'gestion' || isAdmin);
  
  // Determina la ruta de redirección por defecto después del login
  const defaultRedirectPath = () => {
      if (isAdmin || userRole === 'gestion') return '/gestion';
      if (userRole === 'ventas') return '/dashboard';
      return '/login';
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {isAdmin && user && <NavigationHeader user={user} handleLogout={handleLogout} />}
        <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={defaultRedirectPath()} />} />
            
            <Route path="/dashboard" element={
                <ProtectedRoute user={user}>
                    {canAccessVentas ? <Dashboard user={user} handleLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/gestion" />}
                </ProtectedRoute>
            }/>

            <Route path="/gestion" element={
                <ProtectedRoute user={user}>
                    {canAccessGestion ? <Gestiones user={user} handleLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/dashboard" />}
                </ProtectedRoute>
            }/>
            
            <Route path="/new-operation" element={
                <ProtectedRoute user={user}>
                    {canAccessVentas ? <NewOperationPage user={user} /> : <Navigate to="/login" />}
                </ProtectedRoute>
            }/>

            <Route path="*" element={<Navigate to={user ? defaultRedirectPath() : "/login"} />} />
        </Routes>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
