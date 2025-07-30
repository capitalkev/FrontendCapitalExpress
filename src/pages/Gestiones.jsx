import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

// --- Componente Envoltorio para Iconos (Wrapper) ---
const Icon = ({ name, size = 16, ...props }) => {
    const iconMap = { ...LucideIcons, HelpCircle: LucideIcons.HelpCircle };
    const LucideIcon = iconMap[name];
    if (!LucideIcon) {
        return <LucideIcons.HelpCircle size={size} {...props} />;
    }
    return <LucideIcon size={size} {...props} className={`inline-block flex-shrink-0 ${props.className || ''}`} />;
};

// --- Componentes de UI (Reutilizados y Mejorados) ---
const Card = React.forwardRef(({ children, className = "", ...props }, ref) => (
    <motion.div 
        ref={ref} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        className={`bg-white rounded-xl shadow-lg border border-gray-200/60 ${className}`} 
        {...props}
    >
        {children}
    </motion.div>
));
const CardHeader = ({ children, className = "" }) => <div className={`p-5 border-b border-gray-200/60 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-base font-semibold text-gray-800 ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = "" }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
const CardContent = ({ children, className = "" }) => <div className={`p-5 ${className}`}>{children}</div>;

const Button = React.forwardRef(({ className = "", variant = "default", size="default", children, iconName, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";
    const variants = {
        primary: "bg-red-500 text-white shadow-md hover:shadow-lg hover:bg-red-600 focus-visible:ring-red-500",
        secondary: "bg-blue-600 text-white shadow-sm hover:shadow-md hover:bg-blue-700 focus-visible:ring-blue-500",
        outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 shadow-sm",
        success: "bg-green-600 text-white shadow-md hover:shadow-lg hover:bg-green-700 focus-visible:ring-green-500",
        ghost: "hover:bg-gray-100 text-gray-600",
    };
    const sizes = { default: "h-10 px-4 py-2", sm: "h-9 px-3", xs: "h-7 px-2 text-xs", icon: "h-10 w-10" };
    return <button ref={ref} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{iconName && <Icon name={iconName} size={16} className="mr-1"/>}{children}</button>;
});

const Badge = ({ variant, iconName, children, className="", animate=false }) => {
    const variants = {
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        neutral: "bg-gray-100 text-gray-700",
        priority_high: "bg-red-500/10 text-red-700",
        priority_medium: "bg-orange-400/10 text-orange-700",
        priority_low: "bg-green-500/10 text-green-700",
    };
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
            {iconName && <Icon name={iconName} size={14} className={animate ? 'animate-spin' : ''}/>}
            {children}
        </div>
    );
};

const Textarea = React.forwardRef(({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`w-full min-h-[80px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${className}`} {...props} />
));

const ProgressBar = ({ value, max, colorClass="bg-red-500" }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
            <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const TabsContext = React.createContext();
const Tabs = ({ children, defaultValue, className = "" }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    return <TabsContext.Provider value={{ activeTab, setActiveTab }}><div className={className}>{children}</div></TabsContext.Provider>;
};
const TabsList = ({ children, className = "" }) => <div className={`flex items-center border-b border-gray-200 ${className}`}>{children}</div>;
const TabsTrigger = ({ children, value, iconName, className = "" }) => {
    const { activeTab, setActiveTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;
    return <button onClick={() => setActiveTab(value)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-red-500 hover:border-red-300'} ${className}`}>{iconName && <Icon name={iconName} size={14} />} {children}</button>;
};
const TabsContent = ({ children, value, className = "" }) => {
    const { activeTab } = React.useContext(TabsContext);
    return activeTab === value ? <div className={`py-4 ${className}`}>{children}</div> : null;
};

const Modal = ({ isOpen, onClose, children, size = "lg" }) => {
    const sizeClasses = { md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.lg}`} 
                        onClick={e => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Header = ({ user, handleLogout, notifications }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    return (
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Centro de Verificaciones</h1>
                <p className="text-lg text-gray-500">Bienvenido de vuelta, {user?.displayName?.split(' ')[0] || 'Usuario'} 👋</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setIsNotificationsOpen(prev => !prev)}>
                        <Icon name="Bell" />
                        {notifications.filter(n => !n.read).length > 0 && 
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        }
                    </Button>
                    {isNotificationsOpen && <NotificationDropdown notifications={notifications} onClose={() => setIsNotificationsOpen(false)} />}
                </div>
                <Button variant="outline" size="sm" iconName="LogOut" onClick={handleLogout}>Cerrar Sesión</Button>
            </div>
        </header>
    );
};

const NotificationDropdown = ({ notifications, onClose }) => {
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);
    
    const iconMap = { success: "CheckCircle", info: "MessageSquare", warning: "AlertTriangle" };
    const colorMap = { success: "text-green-500", info: "text-blue-500", warning: "text-orange-500" };

    return (
        <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="p-2">
                <div className="px-2 py-1 font-semibold text-sm">Notificaciones</div>
                <ul className="max-h-80 overflow-y-auto">
                    {notifications.map(notif => (
                        <li key={notif.id} className={`p-2 hover:bg-gray-100 rounded-md ${!notif.read ? 'font-semibold' : ''}`}>
                            <div className="flex items-start gap-3">
                                <Icon name={iconMap[notif.type]} className={colorMap[notif.type]} size={20} />
                                <div className="text-xs">
                                    <p className="text-gray-800" dangerouslySetInnerHTML={{__html: notif.message}}></p>
                                    <p className="text-gray-400">{notif.time}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const GestionForm = ({ onSave, onCancel }) => {
    const [gestion, setGestion] = useState({ tipo: 'Llamada', contacto: '', cargo: '', telefono: '', resultado: 'Conforme', notas: '' });
    const handleChange = (e) => { const { name, value } = e.target; setGestion(prev => ({ ...prev, [name]: value })); };
    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Registrar Nueva Gestión</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="tipo" value={gestion.tipo} onChange={handleChange} className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"><option>Llamada</option><option>Email Manual</option><option>WhatsApp</option><option>Visita en Terreno</option></select>
                <select name="resultado" value={gestion.resultado} onChange={handleChange} className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"><option>Conforme</option><option>No Contesta</option><option>Discrepancia de Monto</option><option>Desconoce Factura</option><option>Solicita más tiempo</option></select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <input name="contacto" value={gestion.contacto} onChange={handleChange} placeholder="Nombre Contacto" className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"/>
                 <input name="cargo" value={gestion.cargo} onChange={handleChange} placeholder="Cargo" className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"/>
                 <input name="telefono" value={gestion.telefono} onChange={handleChange} placeholder="Teléfono/Email" className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"/>
            </div>
            <Textarea name="notas" value={gestion.notas} onChange={handleChange} placeholder="Notas cualitativas de la gestión..."/>
            <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
                <Button variant="primary" size="sm" onClick={() => onSave(gestion)} iconName="Save">Guardar Gestión</Button>
            </div>
        </div>
    );
};

const HistorialGestiones = ({ gestiones }) => (
    <div className="space-y-3">
        <h5 className="text-sm font-semibold text-gray-700">Historial de Gestiones</h5>
        {gestiones.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {gestiones.map((g, i) => (
                    <div key={i} className="text-xs p-2 bg-gray-100 rounded-md border border-gray-200">
                        <p className="font-semibold">{g.tipo}: <span className="font-normal text-gray-600">{g.resultado}</span></p>
                        <p className="text-gray-500 italic">"{g.notas}" - {g.analista}</p>
                        <p className="text-right text-gray-400">{new Date(g.fecha).toLocaleString('es-ES')}</p>
                    </div>
                ))}
            </div>
        ) : <p className="text-xs text-gray-500 italic">No hay gestiones manuales registradas.</p>}
    </div>
);

const ContactoInteligente = ({ deudor }) => (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg h-full flex flex-col justify-center">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Icon name="Lightbulb" size={20}/>Asistencia IA ✨</h4>
        <div className="text-sm space-y-2">
            <div>
                <p className="font-semibold text-blue-900/80">Contacto Sugerido:</p>
                <p className="text-blue-900/80"><strong className="text-blue-700">{deudor.contactoEfectivo.nombre}</strong> ({deudor.contactoEfectivo.cargo}) al <strong className="text-blue-700">{deudor.contactoEfectivo.telefono}</strong>.</p>
            </div>
            <div>
                <p className="font-semibold text-blue-900/80">Insight:</p>
                <p className="text-blue-900/80">{deudor.insight}</p>
            </div>
        </div>
    </div>
);

const FacturaChecklist = ({ facturas, onCheck }) => {
    return (
        <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Facturas de la Operación</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {facturas.map(factura => (
                    <div key={factura.folio} className={`p-2 rounded-md border flex items-center justify-between transition-colors ${factura.estado === 'Verificada' ? 'bg-green-50 border-green-200' : factura.estado === 'Rechazada' ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                        <span className="text-sm text-gray-700">{factura.folio} - {new Intl.NumberFormat('es-PE', { style: 'currency', currency: factura.moneda }).format(factura.monto)}</span>
                         <div className="flex items-center gap-1">
                             <button onClick={() => onCheck(factura.folio, 'Rechazada')} title="Rechazar Factura" className="h-6 w-6 rounded-full hover:bg-red-200 text-red-500 flex items-center justify-center"><Icon name="X" size={14}/></button>
                             <button onClick={() => onCheck(factura.folio, 'Verificada')} title="Verificar Factura" className="h-6 w-6 rounded-full hover:bg-green-200 text-green-500 flex items-center justify-center"><Icon name="Check" size={14}/></button>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MetasSemanales = ({ kpis }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="CalendarCheck" className="text-red-500"/>Verificaciones de la Semana</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold text-gray-900">{kpis.verificadasSemana}</p>
            <p className="text-sm text-gray-500">de {kpis.metaSemanal} operaciones</p>
            <ProgressBar value={kpis.verificadasSemana} max={kpis.metaSemanal} colorClass="bg-red-500" />
        </CardContent>
    </Card>
);

const RendimientoHistorico = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="TrendingUp" className="text-green-600"/>Tu Rendimiento Histórico</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-center">
            <p>Tiempo Prom. Verificación (este mes)</p>
            <p className="text-4xl font-bold text-green-600 my-1">6 Horas</p>
            <p className="font-semibold text-green-700">25% más rápido que tu promedio del mes pasado. ¡Excelente mejora!</p>
        </CardContent>
    </Card>
);

const Logros = ({ logros }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="Award" className="text-yellow-500"/>Mis Logros Recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {logros.map(logro => (
                <div key={logro.titulo} className="flex items-center gap-3 text-sm">
                    <span className="text-2xl">{logro.emoji}</span>
                    <div>
                        <p className="font-semibold">{logro.titulo}</p>
                        <p className="text-xs text-gray-500">{logro.descripcion}</p>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

const ActionConfirmationPopup = ({ message, iconName, show }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-5 right-5 bg-gray-900 text-white py-3 px-5 rounded-lg shadow-xl flex items-center gap-3 z-50"
            >
                <Icon name={iconName} className="text-green-400" />
                <span className="font-medium">{message}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

const AdelantoExpressModal = ({ isOpen, onClose, onConfirm, operation }) => {
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = () => {
        if (!justification.trim()) return;
        setIsSubmitting(true);
        setTimeout(() => {
            onConfirm(justification);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setTimeout(() => {
                    setIsSuccess(false);
                    setIsSubmitting(false);
                    setJustification('');
                }, 300);
            }, 1500);
        }, 500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Avanzar a Post-Verificado</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><Icon name="X" size={20}/></Button>
            </div>
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-center py-10"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
                                className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center"
                            >
                                <Icon name="Check" size={48} className="text-green-600" />
                            </motion.div>
                            <h4 className="text-lg font-semibold text-gray-800 mt-4">¡Operación Avanzada!</h4>
                            <p className="text-gray-500">La operación {operation?.id} se ha movido a "Adelanto Express".</p>
                        </motion.div>
                    ) : (
                        <motion.div key="form" exit={{ opacity: 0 }}>
                            <p className="text-sm text-gray-600 mb-4">
                                Estás a punto de mover la operación <strong className="text-gray-800">{operation?.id}</strong> a la cola de "Adelanto Express". Por favor, ingresa una justificación para esta acción.
                            </p>
                            <Textarea 
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Ej: Contacto con Gerente de Finanzas confirmó la operación por teléfono, se espera pago adelantado..."
                                rows={4}
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                                <Button 
                                    variant="primary" 
                                    onClick={handleSubmit} 
                                    disabled={!justification.trim() || isSubmitting}
                                    iconName={isSubmitting ? "LoaderCircle" : "Zap"}
                                >
                                    {isSubmitting ? 'Procesando...' : 'Confirmar Avance'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};


export default function Gestiones({ user, handleLogout, isAdmin = false }) {

    const [activeGestionId, setActiveGestionId] = useState(null);

    const [operaciones, setOperaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOperacionesGestion = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const token = await user.getIdToken();
                // La URL debe coincidir con la de tu orquestador
                const response = await fetch('http://localhost:8000/api/gestiones/operaciones', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('No se pudo obtener la data de gestiones.');
                }
                const data = await response.json();
                setOperaciones(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOperacionesGestion();
    }, [user]);

    
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeFilter, setActiveFilter] = useState('En Proceso');
    const [isAdelantoModalOpen, setIsAdelantoModalOpen] = useState(false);
    const [selectedAdelantoOp, setSelectedAdelantoOp] = useState(null);
    const deudorData = { "Comercial Andina": { tiempoPromedioRespuesta: "48 horas", contactoEfectivo: { nombre: "Juan Pérez", cargo: "Jefe de Tesorería", telefono: "998765432" }, insight: "Suele responder después del 2do correo de seguimiento." }, "Mercados Frescos Inc.": { tiempoPromedioRespuesta: "4 horas", contactoEfectivo: { nombre: "Ana García", cargo: "Analista de Pagos", telefono: "pagos@mercadosfrescos.com" }, insight: "Responde rápidamente a correos con el folio en el asunto." }, "Consorcio Minero": { tiempoPromedioRespuesta: "72+ horas", contactoEfectivo: { nombre: "Carlos Soto", cargo: "Gerente de Finanzas", telefono: "987654321" }, insight: "Contacto difícil. Se recomienda llamar directamente a Gerencia." }, "Proyectos Urbanos": { tiempoPromedioRespuesta: "24 horas", contactoEfectivo: { nombre: "Sofía Reyes", cargo: "Administración", telefono: "987123456" }, insight: "Responde siempre a la primera llamada." }, "Comercializadora del Este": { tiempoPromedioRespuesta: "36 horas", contactoEfectivo: { nombre: "Luis Torres", cargo: "Contador", telefono: "987654123" }, insight: "Prefiere contacto por email." }, "Minera Andina Central": { tiempoPromedioRespuesta: "48 horas", contactoEfectivo: { nombre: "Jorge Luna", cargo: "Jefe de Compras", telefono: "998877665" }, insight: "A veces requiere reenvío de documentos." }, "Supermercados Nacionales": { tiempoPromedioRespuesta: "12 horas", contactoEfectivo: { nombre: "María Paz", cargo: "Pagos", telefono: "pagos@nacionales.com" }, insight: "Proceso estandarizado y eficiente." }};
    const [kpis, setKpis] = useState({ verificadasSemana: 26, metaSemanal: 75 });
    const logros = [{ emoji: '🎯', titulo: 'Verificador Experto', descripcion: 'Completaste 20 verificaciones la semana pasada.' }, { emoji: '⚡', titulo: 'Rápido y Eficaz', descripcion: 'Lograste un tiempo de respuesta promedio de 5h.' }];
    const notifications = [{ id: 1, type: "success", message: "<b>Verificación Aprobada:</b> La operación <b>OP-00124</b> ha sido verificada.", time: "hace 5 minutos", read: false }, { id: 2, type: "info", message: "<b>Respuesta Recibida:</b> El deudor de <b>OP-00125</b> ha respondido tu correo.", time: "hace 2 horas", read: false }, { id: 3, type: "warning", message: "<b>Acción Requerida:</b> La operación <b>OP-00123</b> lleva 3 días sin respuesta.", time: "hace 1 día", read: true }];
    const filteredData = useMemo(() => { const enProceso = operaciones.filter(op => !op.adelantoExpress && op.estado !== 'Completada'); const enAdelanto = operaciones.filter(op => op.adelantoExpress && op.estado !== 'Completada'); switch (activeFilter) { case 'En Proceso': return enProceso; case 'Adelanto Express': return enAdelanto; default: return operaciones.filter(op => op.estado !== 'Completada'); } }, [activeFilter, operaciones]);
    const showPopup = (message) => { setSuccessMessage(message); setShowSuccessPopup(true); setTimeout(() => setShowSuccessPopup(false), 3000); };
    
    const handleSaveGestion = async (opId, gestionData) => {
    try {
        const token = await user.getIdToken();
        const response = await fetch(`URL_ORQUESTADOR/api/operaciones/${opId}/gestiones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(gestionData),
        });
        if (!response.ok) throw new Error('Error al guardar la gestión');
        const nuevaGestion = await response.json();
        setOperaciones(prevOps => prevOps.map(op => 
            op.id === opId 
                ? { ...op, gestiones: [...op.gestiones, { ...nuevaGestion, analista: user.displayName.split(' ')[0] }] } 
                : op
        ));
        setActiveGestionId(null);
        showPopup("¡Gestión guardada con éxito!");

    } catch (error) {
        console.error(error);
        setError("No se pudo guardar la gestión. Por favor, inténtalo de nuevo más tarde.");
    }
};
    

    const handleFacturaCheck = (opId, folio, nuevoEstado) => { setOperaciones(prevOps => prevOps.map(op => { if (op.id === opId) { const nuevasFacturas = op.facturas.map(f => f.folio === folio ? { ...f, estado: nuevoEstado } : f); const todasVerificadas = nuevasFacturas.every(f => f.estado === 'Verificada'); const algunaRechazada = nuevasFacturas.some(f => f.estado === 'Rechazada'); let nuevoEstadoOp = op.estado; if (todasVerificadas) nuevoEstadoOp = 'Conforme'; else if (algunaRechazada) nuevoEstadoOp = 'Discrepancia'; else nuevoEstadoOp = 'En Verificación'; return { ...op, facturas: nuevasFacturas, estado: nuevoEstadoOp }; } return op; })); };
    const handleCompleteVerification = (opId) => { setOperaciones(prevOps => prevOps.map(op => op.id === opId ? { ...op, estado: 'Completada' } : op)); setTimeout(() => { setOperaciones(prevOps => prevOps.filter(op => op.id !== opId)); setKpis(prevKpis => ({...prevKpis, verificadasSemana: prevKpis.verificadasSemana + 1})); showPopup("¡Operación completada!"); }, 300); };
    const handleOpenAdelantoModal = (operation) => { setSelectedAdelantoOp(operation); setIsAdelantoModalOpen(true); };
    const handleConfirmAdelanto = (justification) => { setOperaciones(prevOps => prevOps.map(op => op.id === selectedAdelantoOp.id ? { ...op, adelantoExpress: true, gestiones: [...op.gestiones, { fecha: new Date().toISOString(), tipo: "Adelanto Express", resultado: "Aprobado", notas: justification, analista: "K. Gianecchine" }] } : op)); };

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            {!isAdmin}
            <Header user={user} handleLogout={handleLogout} notifications={notifications} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <main className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <CardTitle>Cola de Tareas de Verificación</CardTitle>
                                <CardDescription>Operaciones asignadas y priorizadas por el sistema.</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                                {['En Proceso', 'Adelanto Express'].map(option => (
                                   <Button key={option} variant={activeFilter === option ? 'primary' : 'outline'} size="sm" onClick={() => setActiveFilter(option)}>{option}</Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {filteredData.length > 0 ? (
                                        filteredData.map(op => <OperationCard key={op.id} operation={op} activeGestionId={activeGestionId} setActiveGestionId={setActiveGestionId} deudorData={deudorData} onSaveGestion={handleSaveGestion} onFacturaCheck={handleFacturaCheck} onCompleteVerification={handleCompleteVerification} onOpenAdelantoModal={handleOpenAdelantoModal} />)
                                    ) : (
                                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-12 text-gray-500"><Icon name="CheckCircle" size={40} className="mx-auto mb-2 opacity-50"/><p className="font-semibold">¡Todo limpio por aquí!</p><p>No hay operaciones en esta vista.</p></motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </main>
                
                <aside className="lg:col-span-1 space-y-6">
                    <MetasSemanales kpis={kpis}/>
                    <RendimientoHistorico />
                    <Logros logros={logros}/>
                </aside>
            </div>
            <ActionConfirmationPopup show={showSuccessPopup} message={successMessage} iconName="CheckCircle" />
            <AdelantoExpressModal 
                isOpen={isAdelantoModalOpen} 
                onClose={() => setIsAdelantoModalOpen(false)}
                onConfirm={handleConfirmAdelanto}
                operation={selectedAdelantoOp}
            />
        </div>
    );
}

const OperationCard = ({ operation, activeGestionId, setActiveGestionId, deudorData, onSaveGestion, onFacturaCheck, onCompleteVerification, onOpenAdelantoModal }) => {
    const isGestionOpen = activeGestionId === operation.id;
    const allInvoicesVerified = operation.facturas.every(f => f.estado === 'Verificada');
    const antiquity = Math.ceil(Math.abs(new Date() - new Date(operation.fechaIngreso)) / (1000*60*60*24)) || 0;
    const formatCurrency = (value, currency) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

    return (
        <Card>
            {operation.alertaIA && (
                <div className={`px-5 py-2 text-sm font-semibold flex items-center gap-2 rounded-t-xl ${operation.alertaIA.tipo === 'llamar' ? 'bg-orange-400 text-white' : 'bg-purple-600 text-white'}`}>
                    <Icon name={operation.alertaIA.tipo === 'llamar' ? 'PhoneCall' : 'MapPin'} size={18}/> {operation.alertaIA.texto}
                </div>
            )}
            <CardContent>
                 <div className="grid grid-cols-10 gap-x-4 gap-y-4 items-center">
                    <div className="col-span-12 md:col-span-3">
                        <p className="font-bold text-red-600">{operation.id}</p>
                        <p className="text-lg font-semibold text-gray-900 truncate" title={operation.cliente}>{operation.cliente}</p>
                        <p className="text-sm text-gray-500 truncate" title={operation.deudor}>Deudor: {operation.deudor}</p>
                    </div>

                    <div className="col-span-12 md:col-span-5 grid grid-cols-3 gap-x-4 text-left">
                        <div>
                            <p className="text-xs text-gray-500">Monto Op.</p>
                            <p className="font-semibold text-blue-600 whitespace-nowrap">{formatCurrency(operation.facturas.reduce((sum, f) => sum + f.monto, 0), operation.facturas[0]?.moneda || 'PEN')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Antigüedad</p>
                            <p className={`font-semibold ${antiquity > 3 ? 'text-red-600' : 'text-gray-800'}`}>{antiquity} días</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Gestión</p>
                            <div className="flex items-center gap-3 text-gray-700 font-semibold">
                                <span className="flex items-center gap-1" title="Correos automáticos"><Icon name="Mail" size={14}/> {operation.correosEnviados}</span>
                                <span className="flex items-center gap-1" title="Gestiones manuales"><Icon name="Phone" size={14}/> {operation.gestiones.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-2 flex justify-start md:justify-end">
                        {allInvoicesVerified ? (
                            <Button variant="success" onClick={() => onCompleteVerification(operation.id)} className="w-full md:w-auto">
                                <Icon name="CheckCheck" size={18}/> Completar
                            </Button>
                        ) : (
                            <Button variant="secondary" onClick={() => setActiveGestionId(isGestionOpen ? null : operation.id)} className="w-full md:w-auto">
                                <Icon name={isGestionOpen ? "ChevronUp" : "ClipboardEdit"} size={18}/> {isGestionOpen ? "Cerrar" : "Gestionar"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
            <AnimatePresence>
                {isGestionOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 border-t border-gray-200/60 bg-gray-50/50">
                            <Tabs defaultValue="gestion">
                                <TabsList>
                                    <TabsTrigger value="facturas" iconName="ListChecks">Facturas ({operation.facturas.filter(f=>f.estado === 'Verificada').length}/{operation.facturas.length})</TabsTrigger>
                                    <TabsTrigger value="gestion" iconName="PlusCircle">Registrar Gestión</TabsTrigger>
                                    <TabsTrigger value="historial" iconName="History">Historial</TabsTrigger>
                                    <TabsTrigger value="ia" iconName="Lightbulb">Asistencia IA</TabsTrigger>
                                </TabsList>
                                <TabsContent value="gestion">
                                    <GestionForm onSave={(gestionData) => onSaveGestion(operation.id, gestionData)} onCancel={() => setActiveGestionId(null)} />
                                </TabsContent>
                                <TabsContent value="facturas">
                                    <FacturaChecklist facturas={operation.facturas} onCheck={(folio, estado) => onFacturaCheck(operation.id, folio, estado)} />
                                </TabsContent>
                                <TabsContent value="historial">
                                    <HistorialGestiones gestiones={operation.gestiones} />
                                </TabsContent>
                                <TabsContent value="ia">
                                    <ContactoInteligente deudor={{...deudorData[operation.deudor], nombre: operation.deudor}}/>
                                </TabsContent>
                            </Tabs>
                            <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                                <Button variant="outline" size="sm" iconName="Zap" onClick={() => onOpenAdelantoModal(operation)}>
                                    Avanzar a Post-Verificado (Adelanto Express)
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
};