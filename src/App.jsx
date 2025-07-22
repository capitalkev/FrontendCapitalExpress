// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; // Importamos desde nuestro archivo de configuración

// Importamos las páginas
import NewOperationPage from './pages/NewOperationPage';
import LoginPage from './pages/LoginPage'; // Importamos la página de login
import { Button } from './components/ui/Button';
import { Icon } from './components/Icon';

// Un componente simple para mostrar mientras se verifica la sesión
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral">
    <Icon name="Loader" className="animate-spin text-blue-600" size={48} />
  </div>
);

// Un componente para las rutas protegidas
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // Si no hay usuario, redirige a la página de login
    return <Navigate to="/login" />;
  }
  return children;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es un "observador" que se ejecuta cada vez que el estado de auth cambia.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpiamos el observador cuando el componente se desmonta
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
      {user && (
        <header className="absolute top-0 right-0 p-4">
          <Button onClick={handleLogout} variant="outline" size="sm">
            <Icon name="LogOut" className="mr-2" size={14} />
            Cerrar Sesión
          </Button>
        </header>
      )}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <NewOperationPage user={user}/>
            </ProtectedRoute>
          }
        />
        {/* Puedes agregar más rutas protegidas aquí */}
      </Routes>
    </Router>
  );
}