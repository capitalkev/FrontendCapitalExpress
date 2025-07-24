import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

import NewOperationPage from './pages/NewOperationPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { Icon } from './components/Icon';

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <Icon name="Loader" className="animate-spin text-blue-600" size={48} />
    </div>
);

// --- ✨ PROTECTEDROUTE SIMPLIFICADO ---
// Ahora solo se encarga de verificar si el usuario existe.
const ProtectedRoute = ({ user, children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/Dashboard" /> : <LoginPage />} />
        
        {/* --- ✨ RUTAS CORREGIDAS --- */}
        {/* Ahora pasamos las props directamente a los componentes de la página */}
        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/new-operation"
          element={
            <ProtectedRoute user={user}>
              <NewOperationPage user={user} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}