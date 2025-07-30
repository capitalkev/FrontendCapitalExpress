import { useState, useEffect, useCallback, useMemo } from 'react';

// URL del backend. Idealmente, esto debería venir de una variable de entorno.
const API_BASE_URL = 'http://localhost:8000/api';

export const useGestiones = (user) => {
    // --- ESTADOS PRINCIPALES ---
    const [operaciones, setOperaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- ESTADOS DE UI ---
    const [activeFilter, setActiveFilter] = useState('En Proceso');
    const [activeGestionId, setActiveGestionId] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isAdelantoModalOpen, setIsAdelantoModalOpen] = useState(false);
    const [selectedAdelantoOp, setSelectedAdelantoOp] = useState(null);

    // --- LÓGICA DE DATOS ---
    const fetchOperaciones = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/gestiones/operaciones`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'No se pudo obtener la data de gestiones.');
            }
            const data = await response.json();
            setOperaciones(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchOperaciones();
    }, [fetchOperaciones]);

    const filteredData = useMemo(() => {
        const enProceso = operaciones.filter(op => !op.adelantoExpress);
        const enAdelanto = operaciones.filter(op => op.adelantoExpress);
        if (activeFilter === 'En Proceso') return enProceso;
        if (activeFilter === 'Adelanto Express') return enAdelanto;
        return operaciones;
    }, [activeFilter, operaciones]);
    
    // --- MANEJADORES DE ACCIONES ---
    const showPopup = (message) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
    };

    const handleSaveGestion = useCallback(async (opId, gestionData) => {
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/operaciones/${opId}/gestiones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(gestionData),
            });
            if (!response.ok) throw new Error('Error al guardar la gestión');
            
            await fetchOperaciones(); // Recarga los datos para obtener el estado más reciente
            setActiveGestionId(null);
            showPopup("¡Gestión guardada con éxito!");
        } catch (error) {
            setError("No se pudo guardar la gestión.");
        }
    }, [user, fetchOperaciones]);
    
    const handleFacturaCheck = useCallback(async (opId, folio, nuevoEstado) => {
    setOperaciones(prevOps =>
        prevOps.map(op => {
            if (op.id === opId) {
                const nuevasFacturas = op.facturas.map(f =>
                    f.folio === folio ? { ...f, estado: nuevoEstado } : f
                );
                // Predecimos el nuevo estado de la operación basado en la lógica del backend
                const algunaRechazada = nuevasFacturas.some(f => f.estado === 'Rechazada');
                const todasVerificadas = nuevasFacturas.every(f => f.estado === 'Verificada');
                let nuevoEstadoOp = 'En Verificación';
                if (algunaRechazada) nuevoEstadoOp = 'Discrepancia';
                else if (todasVerificadas) nuevoEstadoOp = 'Conforme';
                
                return { ...op, facturas: nuevasFacturas, estadoOperacion: nuevoEstadoOp };
            }
            return op;
        })
    );

    try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/operaciones/${opId}/facturas/${folio}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        if (!response.ok) throw new Error('La sincronización con el servidor falló.');
    } catch (error) {
        console.error("Error al sincronizar el estado de la factura:", error);
        setError("Falló la actualización de la factura. Por favor, recargue la página.");
    }
}, [user]);

    const handleOpenAdelantoModal = (operation) => {
        setSelectedAdelantoOp(operation);
        setIsAdelantoModalOpen(true);
    };

    const handleConfirmAdelanto = useCallback(async (justification) => {
        if (!selectedAdelantoOp) return;
        try {
            const token = await user.getIdToken();
            await fetch(`${API_BASE_URL}/operaciones/${selectedAdelantoOp.id}/adelanto-express`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ justificacion }), // 'justification' debe ser 'justificacion'
            });
            await fetchOperaciones();
            setIsAdelantoModalOpen(false);
        } catch (err) {
            setError("No se pudo mover la operación a Adelanto Express.");
        }
    }, [user, selectedAdelantoOp, fetchOperaciones]);

    const handleCompleteOperation = useCallback(async (opId) => {
        try {
            const token = await user.getIdToken();
            await fetch(`${API_BASE_URL}/operaciones/${opId}/completar`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Actualización optimista: elimina la operación de la lista sin esperar recarga
            setOperaciones(prevOps => prevOps.filter(op => op.id !== opId));
            showPopup("Operación completada y archivada.");

        } catch (err) {
            setError("No se pudo completar la operación.");
        }
    }, [user]);

    // Devolvemos el estado y las funciones que los componentes necesitan
    return {
        isLoading,
        error,
        filteredData,
        activeFilter,
        setActiveFilter,
        activeGestionId,
        setActiveGestionId,
        showSuccessPopup,
        successMessage,
        isAdelantoModalOpen,
        setIsAdelantoModalOpen,
        selectedAdelantoOp,
        handleSaveGestion,
        handleFacturaCheck,
        handleOpenAdelantoModal,
        handleConfirmAdelanto,
        handleCompleteOperation
    };
};