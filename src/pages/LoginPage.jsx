import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import logo from '/logo.png'; 

const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center"
    role="alert"
  >
    <span className="block sm:inline">{message}</span>
  </motion.div>
);

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const errorCode = searchParams.get('error');
    if (errorCode === 'invalid_domain') {
      setError('Acceso denegado. Solo se permiten correos del dominio @capitalexpress.pe.');
    } else if (errorCode === 'auth_failed') {
      setError('Falló la autenticación con Google. Por favor, intenta de nuevo.');
    }
  }, [searchParams]);

  const handleLogin = () => {
    setError(null); 
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-xl border border-gray-200 rounded-2xl p-8 space-y-6"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="Capital Express" className="h-14" />
        </div>

        {/* Título */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Acceso al Portal de Verificaciones</h1>
          <p className="text-sm text-gray-500 mt-2">
            Solo disponible para correos <span className="text-[#f24123] font-medium">@capitalexpress.pe</span>
          </p>
        </div>

        {/* Mensaje de Error (solo se muestra si existe un error) */}
        {error && <ErrorMessage message={error} />}

        {/* Botón Google */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#f24123] hover:bg-[#d6361b] text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Iniciar sesión con Google
        </motion.button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Capital Express &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}