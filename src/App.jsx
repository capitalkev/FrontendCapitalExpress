import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importamos las páginas
import LoginPage from './pages/LoginPage';
import NewOperationPage from './pages/NewOperationPage';

// Un componente simple para mostrar mientras se verifica la sesión
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    {/* Aquí puedes poner un spinner o un logo animado */}
    <p>Cargando...</p> 
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect se ejecuta una vez cuando la aplicación carga
  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        // Hacemos la petición al endpoint protegido que creamos en el backend
        // El navegador enviará la cookie 'access_token' automáticamente
        const response = await fetch('/api/users/me');

        if (response.ok) {
          // Si la respuesta es 200 OK, el token es válido y el usuario está autenticado
          setIsAuthenticated(true);
        } else {
          // Si es 401 o cualquier otro error, no está autenticado
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Si hay un error de red, asumimos que no está autenticado
        setIsAuthenticated(false);
      } finally {
        // Terminamos la carga inicial
        setIsLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  // Mientras verificamos la sesión, mostramos una pantalla de carga
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* RUTA DE LOGIN: Si el usuario ya está autenticado, lo redirige al dashboard */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
        />
        
        {/* RUTA DEL DASHBOARD/FORMULARIO: Es la ruta protegida */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <NewOperationPage /> : <Navigate to="/login" />} 
        />
        
        {/* Redirección por defecto: si entra a cualquier otra ruta, lo mandamos al dashboard o al login */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}