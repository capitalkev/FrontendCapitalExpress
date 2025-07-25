import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

import NewOperationPage from './pages/NewOperationPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Gestiones from './pages/Gestiones';
import { Icon } from './components/Icon';

// ... (LoadingSpinner and ProtectedRoute components remain the same)
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

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        let role = 'ventas';
        if (currentUser.email === 'kevin.tupac@capitalexpress.cl') {
          role = 'gestion';
        }
        setUserRole(role);
        
        const currentPath = window.location.pathname;
        if(currentPath === '/login' || currentPath === '/'){
            navigate(role === 'gestion' ? '/gestion' : '/dashboard');
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

  const isAdmin = user?.email === 'kevin.tupac@capitalexpress.cl'|| user?.email === 'kevin.gianecchine@capitalexpress.cl';
  const canAccessVentas = user && (userRole === 'ventas' || isAdmin);
  const canAccessGestion = user && (userRole === 'gestion' || isAdmin);
  
  return (
    <div className="min-h-screen bg-gray-50">
        {isAdmin && user && <NavigationHeader user={user} handleLogout={handleLogout} />}
        <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={userRole === 'gestion' ? '/gestion' : '/dashboard'} />} />
            
            <Route path="/dashboard" element={
                <ProtectedRoute user={user}>
                    {canAccessVentas ? <Dashboard user={user} handleLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/login" />}
                </ProtectedRoute>
            }/>

            <Route path="/gestion" element={
                <ProtectedRoute user={user}>
                    {canAccessGestion ? <Gestiones user={user} handleLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/login" />}
                </ProtectedRoute>
            }/>
            
            <Route path="/new-operation" element={
                <ProtectedRoute user={user}>
                    {canAccessVentas ? <NewOperationPage user={user} /> : <Navigate to="/login" />}
                </ProtectedRoute>
            }/>

            <Route path="*" element={<Navigate to={user ? (userRole === 'gestion' ? '/gestion' : '/dashboard') : "/login"} />} />
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