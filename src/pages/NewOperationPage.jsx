// src/pages/NewOperationPage.jsx

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Asegúrate de que las rutas a tus componentes sean correctas
import { Icon } from "../components/Icon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import { InputGroup, Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { FileInput } from "../components/FileInput";
import { FileListItem } from "../components/FileListItem";
import { FormSection } from "../components/FormSection";
import { ProcessingModal } from '../components/ProcessingModal'; // Importamos el modal actualizado

export default function NewOperationPage() {
  // --- Estados del Formulario ---
  const [formData, setFormData] = useState({
    tasaOperacion: "",
    comision: "",
    mailVerificacion: "",
  });
  const [xmlFiles, setXmlFiles] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [respaldoFiles, setRespaldoFiles] = useState([]);
  const [solicitarAdelanto, setSolicitarAdelanto] = useState(false);
  const [porcentajeAdelanto, setPorcentajeAdelanto] = useState("");
  const [cuentas, setCuentas] = useState([
    { id: Date.now(), banco: "", tipo: "Corriente", numero: "", moneda: "PEN" },
  ]);

  // --- Estado para el modal de procesamiento ---
  const [processState, setProcessState] = useState({
    isLoading: false,
    error: null,
    successData: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "tasaOperacion" || name === "comision" || name === "porcentajeAdelanto") {
      const numericValue = value
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*?)\..*/g, "$1");
      
      if (name === "porcentajeAdelanto") {
        if (parseInt(numericValue, 10) <= 100 || numericValue === "") {
          setPorcentajeAdelanto(numericValue);
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleFileChange = useCallback((files, type) => {
    const fileList = Array.from(files);
    const setter = { xml: setXmlFiles, pdf: setPdfFiles, respaldo: setRespaldoFiles }[type];
    if (setter) setter((prev) => [...prev, ...fileList]);
  }, []);

  const handleRemoveFile = useCallback((fileName, type) => {
    const setter = { xml: setXmlFiles, pdf: setPdfFiles, respaldo: setRespaldoFiles }[type];
    if (setter) setter((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  const handleCuentaChange = useCallback((index, field, value) => {
    const nuevasCuentas = [...cuentas];
    nuevasCuentas[index][field] = value;
    setCuentas(nuevasCuentas);
  }, [cuentas]);

  const agregarCuenta = useCallback(() => {
    setCuentas((prev) => [
      ...prev,
      { id: Date.now(), banco: "", tipo: "Corriente", numero: "", moneda: "PEN" },
    ]);
  }, []);

  const eliminarCuenta = useCallback((id) => {
    setCuentas((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ tasaOperacion: "", comision: "", mailVerificacion: "" });
    setXmlFiles([]);
    setPdfFiles([]);
    setRespaldoFiles([]);
    setSolicitarAdelanto(false);
    setPorcentajeAdelanto("");
    setCuentas([{ id: Date.now(), banco: "", tipo: "Corriente", numero: "", moneda: "PEN" }]);
    setIsModalOpen(false);
    setProcessState({ isLoading: false, error: null, successData: null });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Iniciar el estado de carga y abrir el modal
    setProcessState({ isLoading: true, error: null, successData: null });
    setIsModalOpen(true);

    // 2. Preparar los datos del formulario
    const data = new FormData();
    const metadata = {
        user_email: "kevin.tupac@capitalexpress.cl", // Esto debería venir de la sesión del usuario
        tasaOperacion: parseFloat(formData.tasaOperacion),
        comision: parseFloat(formData.comision),
        mailVerificacion: formData.mailVerificacion,
        solicitudAdelanto: { solicita: solicitarAdelanto, porcentaje: solicitarAdelanto ? parseFloat(porcentajeAdelanto) : 0 },
        cuentasDesembolso: cuentas.filter((c) => c.banco && c.numero),
    };
    data.append("metadata", JSON.stringify(metadata));
    xmlFiles.forEach((file) => data.append("xml_files", file));
    pdfFiles.forEach((file) => data.append("pdf_files", file));
    respaldoFiles.forEach((file) => data.append("respaldo_files", file));

    try {
        // 3. Enviar la petición al endpoint del orquestador
        const response = await fetch(`http://localhost:8000/submit-operation`, {
            method: "POST",
            body: data,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Ocurrió un error desconocido en el servidor.");
        }

        // 4. En caso de éxito, actualizar el estado para mostrar los resultados en el modal
        setProcessState({ isLoading: false, error: null, successData: result });

    } catch (error) {
        // 5. En caso de error, actualizar el estado para mostrar el mensaje de error en el modal
        console.error("Error al registrar la operación:", error);
        setProcessState({ isLoading: false, error: error.message, successData: null });
    }
  };

  const isFormValid =
    formData.tasaOperacion &&
    formData.comision &&
    xmlFiles.length > 0 &&
    pdfFiles.length > 0 &&
    respaldoFiles.length > 0 &&
    (!solicitarAdelanto ||
      (solicitarAdelanto &&
        parseFloat(porcentajeAdelanto) > 0 &&
        parseFloat(porcentajeAdelanto) <= 100));

  const bancosPeruanos = ["BCP", "Interbank", "BBVA", "Scotiabank", "BanBif", "Pichincha", "GNB", "Mibanco", "Otro"];

  return (
    <div className="bg-neutral min-h-screen w-full flex items-start justify-center p-4 sm:p-6 lg:p-8">
        <ProcessingModal 
            isOpen={isModalOpen} 
            processState={processState}
            onClose={resetForm} 
        />
      
        <Card className="w-full max-w-3xl mx-auto">
           <CardHeader>
             <CardTitle iconName="FilePlus">Registro de Nueva Operación</CardTitle>
             <CardDescription>Completa todos los campos para registrar una nueva operación de factoring.</CardDescription>
           </CardHeader>
           <form onSubmit={handleSubmit}>
              <CardContent className="space-y-8">
                
                <FormSection number="1" title="Datos de la Operación">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputGroup label="Tasa de Operación *" htmlFor="tasaOperacion">
                      <Input id="tasaOperacion" name="tasaOperacion" type="text" placeholder="Ej: 2.5" value={formData.tasaOperacion} onChange={handleInputChange} icon={<Icon name="Percent" className="text-muted" />} required/>
                    </InputGroup>
                    <InputGroup label="Comisión (S/.) *" htmlFor="comision">
                      <Input id="comision" name="comision" type="text" placeholder="Ej: 150.00" value={formData.comision} onChange={handleInputChange} icon={<Icon name="DollarSign" className="text-muted" />} required/>
                    </InputGroup>
                  </div>
                </FormSection>

                <FormSection number="2" title="Documentos de la Factura">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FileInput onFileChange={(files) => handleFileChange(files, "xml")} accept=".xml,text/xml" title="Adjuntar XML *" iconName="FileCode"/>
                      {xmlFiles.length > 0 && <div className="space-y-1.5 pt-2">{xmlFiles.map((f, i) => <FileListItem key={`${i}-${f.name}`} file={f} onRemove={() => handleRemoveFile(f.name, "xml")}/>)}</div>}
                    </div>
                    <div className="space-y-2">
                      <FileInput onFileChange={(files) => handleFileChange(files, "pdf")} accept=".pdf,application/pdf" title="Adjuntar PDF *" iconName="FileText"/>
                      {pdfFiles.length > 0 && <div className="space-y-1.5 pt-2">{pdfFiles.map((f, i) => <FileListItem key={`${i}-${f.name}`} file={f} onRemove={() => handleRemoveFile(f.name, "pdf")}/>)}</div>}
                    </div>
                  </div>
                </FormSection>

                <FormSection number="3" title="Respaldos Obligatorios">
                  <FileInput onFileChange={(files) => handleFileChange(files, "respaldo")} accept="image/*,.pdf,.doc,.docx" title="Adjuntar Respaldos *" iconName="Briefcase"/>
                  {respaldoFiles.length > 0 && <div className="space-y-1.5 pt-2">{respaldoFiles.map((f, i) => <FileListItem key={`${i}-${f.name}`} file={f} onRemove={() => handleRemoveFile(f.name, "respaldo")}/>)}</div>}
                </FormSection>

                <FormSection number="4" title="Configuración Adicional">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border">
                      <div>
                        <label htmlFor="adelantoSwitch" className="font-medium">¿Solicitar Adelanto?</label>
                        <p className="text-xs text-gray-500">Permite adelantar un % de la operación.</p>
                      </div>
                      <ToggleSwitch enabled={solicitarAdelanto} setEnabled={setSolicitarAdelanto}/>
                    </div>

                    <AnimatePresence>
                      {solicitarAdelanto && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pl-4">
                          <InputGroup label="Porcentaje de Adelanto (%) *" htmlFor="porcentajeAdelanto">
                            <Input id="porcentajeAdelanto" name="porcentajeAdelanto" type="text" placeholder="Ej: 30" value={porcentajeAdelanto} onChange={handleInputChange} icon={<Icon name="Percent" className="text-muted" />} required={solicitarAdelanto}/>
                          </InputGroup>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <InputGroup label="Mail de Verificación Adicional" htmlFor="mailVerificacion" optional>
                      <Input id="mailVerificacion" name="mailVerificacion" type="email" placeholder="Ej: pagos@deudor.com" value={formData.mailVerificacion} onChange={handleInputChange} icon={<Icon name="Mail" className="text-muted" />}/>
                    </InputGroup>

                    <div>
                      <h4 className="text-base font-medium text-gray-600 mb-2">Cuentas de Desembolso</h4>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {cuentas.map((cuenta, index) => (
                            <motion.div key={cuenta.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 sm:grid-cols-10 gap-2 items-center">
                              <div className="sm:col-span-3">
                                <select value={cuenta.banco} onChange={(e) => handleCuentaChange(index, "banco", e.target.value)} className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                  <option value="">Seleccione Banco...</option>
                                  {bancosPeruanos.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <select value={cuenta.tipo} onChange={(e) => handleCuentaChange(index, "tipo", e.target.value)} className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                  <option>Corriente</option><option>Ahorros</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <select value={cuenta.moneda} onChange={(e) => handleCuentaChange(index, "moneda", e.target.value)} className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                  <option>PEN</option><option>USD</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <Input placeholder="Número de Cuenta" value={cuenta.numero} onChange={(e) => handleCuentaChange(index, "numero", e.target.value.replace(/[^0-9-]/g, ""))}/>
                              </div>
                              {cuentas.length > 1 && <Button type="button" variant="destructive" size="xs" onClick={() => eliminarCuenta(cuenta.id)} className="h-10 w-10 p-0 sm:col-span-1"><Icon name="Trash2" size={16}/></Button>}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <Button type="button" variant="outline" size="sm" onClick={agregarCuenta} iconName="PlusCircle">Agregar otra cuenta</Button>
                      </div>
                    </div>
                  </div>
                </FormSection>

              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={!isFormValid || (isModalOpen && processState.isLoading)}>
                    <Icon name={isModalOpen && processState.isLoading ? "Loader" : "CheckCircle"} className={isModalOpen && processState.isLoading ? "animate-spin mr-2" : "mr-2"}/>
                    {isModalOpen && processState.isLoading ? "Procesando..." : "Registrar Operación"}
                </Button>
              </CardFooter>
           </form>
        </Card>
    </div>
  );
}