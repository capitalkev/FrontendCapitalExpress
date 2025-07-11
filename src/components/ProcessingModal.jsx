// src/components/ProcessingModal.jsx

import React from 'react';
import { Icon } from './Icon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';

// Componente para mostrar el resultado de una operación creada
const SuccessOperationItem = ({ op }) => (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
        <p className="font-semibold text-green-800">Operación Creada: {op.operation_id}</p>
        <div className="text-green-700 mt-1">
            <span>Moneda: <strong>{op.currency}</strong></span> |
            <span className="ml-2">Facturas: <strong>{op.invoice_count}</strong></span>
        </div>
        <a href={op.drive_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block">
            Ver carpeta en Drive
        </a>
    </div>
);

export const ProcessingModal = ({ isOpen, processState, onClose }) => {
    if (!isOpen) return null;

    const { isLoading, error, successData } = processState;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8">
                    <Icon name="Loader" className="animate-spin text-blue-500 h-12 w-12" />
                    <p className="mt-4 font-semibold text-lg text-gray-700">Procesando tu operación...</p>
                    <p className="text-sm text-gray-500">Esto puede tardar unos momentos. No cierres la ventana.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8">
                    <Icon name="XCircle" className="text-red-500 h-12 w-12 mx-auto" />
                    <p className="mt-4 font-semibold text-lg text-red-700">Ocurrió un Error</p>
                    <p className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
                </div>
            );
        }

        if (successData) {
            return (
                <div className="p-2">
                    <div className="text-center mb-6">
                         <Icon name="CheckCircle" className="text-green-500 h-12 w-12 mx-auto" />
                         <p className="mt-4 font-semibold text-lg text-green-800">{successData.message}</p>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {successData.operations.map(op => (
                            <SuccessOperationItem key={op.operation_id} op={op} />
                        ))}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader>
                    <CardTitle iconName="Zap">Estado de la Operación</CardTitle>
                    <CardDescription>
                        {isLoading ? "Aguarde mientras procesamos todo." : "El proceso ha finalizado."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
                <CardFooter>
                    <Button onClick={onClose} className="w-full" disabled={isLoading}>
                        {isLoading ? "Procesando..." : (error ? "Cerrar" : "Finalizar")}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};