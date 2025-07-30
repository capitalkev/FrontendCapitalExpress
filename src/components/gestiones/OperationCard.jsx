import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Icon } from "../Icon";
import { GestionPanel } from "./GestionPanel";

export const OperationCard = React.memo(
  ({
    operation,
    activeGestionId,
    setActiveGestionId,
    onSaveGestion,
    onFacturaCheck,
    onOpenAdelantoModal,
    onCompleteOperation, // <--- Prop para la nueva acción
  }) => {
    const isGestionOpen = activeGestionId === operation.id;
    const isConforme = operation.estadoOperacion === "Conforme";
    const antiquity = operation.antiquity || 0;

    const formatCurrency = (value, currency) =>
      new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    return (
      <Card layout>
        {operation.alertaIA && (
          <div
            className={`px-5 py-2 text-sm font-semibold flex items-center gap-2 rounded-t-xl ${
              operation.alertaIA.tipo === "llamar"
                ? "bg-orange-400 text-white"
                : "bg-purple-600 text-white"
            }`}
          >
            <Icon
              name={
                operation.alertaIA.tipo === "llamar"
                  ? "PhoneCall"
                  : "AlertTriangle"
              }
              size={18}
            />
            {operation.alertaIA.texto}
          </div>
        )}
        <CardContent>
          <div className="grid grid-cols-10 gap-x-4 gap-y-4 items-center">
            <div className="col-span-12 md:col-span-3">
              <p className="font-bold text-red-600">{operation.id}</p>
              <p
                className="text-lg font-semibold text-gray-900 truncate"
                title={operation.cliente}
              >
                {operation.cliente}
              </p>
              <p
                className="text-sm text-gray-500 truncate"
                title={operation.deudor}
              >
                Deudor: {operation.deudor}
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 grid grid-cols-3 gap-x-4 text-left">
              <div>
                <p className="text-xs text-gray-500">Monto Op.</p>
                <p className="font-semibold text-blue-600 whitespace-nowrap">
                  {formatCurrency(operation.montoTotal, operation.moneda)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Antigüedad</p>
                <p
                  className={`font-semibold ${
                    antiquity > 3 ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  {antiquity} días
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gestión</p>
                <div className="flex items-center gap-3 text-gray-700 font-semibold">
                  <span
                    className="flex items-center gap-1"
                    title="Correos automáticos"
                  >
                    <Icon name="Mail" size={14} /> {operation.correosEnviados}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title="Gestiones manuales"
                  >
                    <Icon name="Phone" size={14} /> {operation.gestiones.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-2 flex justify-start md:justify-end text-white">
              {isConforme ? (
                <Button
                  variant="success"
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                  onClick={() => onCompleteOperation(operation.id)}
                >
                  <Icon name="CheckCheck" size={18} /> Completar
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    setActiveGestionId(isGestionOpen ? null : operation.id)
                  }
                >
                  <Icon
                    name={isGestionOpen ? "ChevronUp" : "ClipboardEdit"}
                    size={18}
                  />
                  {isGestionOpen ? "Cerrar" : "Gestionar"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        <AnimatePresence>
          {isGestionOpen && (
            <GestionPanel
              operation={operation}
              onSaveGestion={onSaveGestion}
              onFacturaCheck={onFacturaCheck}
              onOpenAdelantoModal={onOpenAdelantoModal}
              onCancel={() => setActiveGestionId(null)}
            />
          )}
        </AnimatePresence>
      </Card>
    );
  }
);
