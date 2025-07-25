import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom'; // <-- Import ReactDOM for portals
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    <div ref={ref} className={`bg-white rounded-xl shadow-lg border border-gray-200/80 ${className}`} {...props}>{children}</div>
));
const CardHeader = ({ children, className = "" }) => <div className={`p-5 border-b border-gray-200/80 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-base font-semibold text-gray-800 ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = "" }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
const CardContent = ({ children, className = "" }) => <div className={`p-5 ${className}`}>{children}</div>;

const Button = React.forwardRef(({ className = "", variant = "default", size="default", children, iconName, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";
    const variants = {
        default: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700",
        ghost: "hover:bg-gray-100 text-gray-800",
        success: "bg-green-600 text-white hover:bg-green-700",
    };
    const sizes = { default: "h-10 px-4 py-2", sm: "h-9 px-3", xs: "h-7 px-2 text-xs" };
    return <button ref={ref} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{iconName && <Icon name={iconName} size={16} className="mr-1"/>}{children}</button>;
});

const Badge = ({ variant, iconName, children, className="", animate=false }) => {
    const variants = {
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        neutral: "bg-gray-100 text-gray-700",
    };
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
            {iconName && <Icon name={iconName} size={14} className={animate ? 'animate-spin' : ''}/>}
            {children}
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => {
    if (!isOpen) return null;
    const sizeClasses = { md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.lg}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><Icon name="X" size={20}/></Button>
                </div>
                <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

const ProgressBar = ({ value, max, colorClass="bg-blue-500" }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
            <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

// --- Componentes Específicos del Dashboard ---
const SugerenciasIA = ({ operaciones }) => {
    const operacionesAntiguas = operaciones.filter(op => {
        const antiquity = Math.ceil(Math.abs(new Date() - new Date(op.fechaIngreso)) / (1000 * 60 * 60 * 24)) || 0;
        return antiquity > 15 && op.estado === "En Verificación";
    });

    if (operacionesAntiguas.length === 0) return null;

    return (
        <Card className="bg-blue-50 border-blue-200 mb-8">
            <CardContent className="flex items-start gap-4 p-4">
                <Icon name="Lightbulb" size={24} className="text-blue-600 mt-1"/>
                <div>
                    <h4 className="font-semibold text-blue-800">Sugerencias del Día por IA ✨</h4>
                    <p className="text-sm text-blue-700/90">
                        Hola, tienes <strong className="font-bold">{operacionesAntiguas.length} {operacionesAntiguas.length > 1 ? 'operaciones' : 'operación'} con más de 15 días de antigüedad</strong>. Considera priorizar la gestión de {operacionesAntiguas.map(op => <strong key={op.id} className="font-bold">{op.id}</strong>).reduce((prev, curr) => [prev, ', ', curr])}.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

const MetasPersonales = ({ kpis }) => ( <Card> <CardHeader> <CardTitle className="flex items-center gap-2"><Icon name="Target" className="text-purple-600"/>Meta de Colocación Mensual</CardTitle> </CardHeader> <CardContent> <p className="text-3xl font-bold text-gray-900">S/ {kpis.colocacionMensual.toLocaleString('es-PE')}</p> <p className="text-sm text-gray-500">de S/ {kpis.metaColocacion.toLocaleString('es-PE')}</p> <ProgressBar value={kpis.colocacionMensual} max={kpis.metaColocacion} colorClass="bg-purple-500" /> <p className="text-xs text-purple-700 mt-2">¡Vas al {kpis.metaColocacion > 0 ? ((kpis.colocacionMensual / kpis.metaColocacion) * 100).toFixed(0) : 0}%!</p> </CardContent> </Card> );
const RendimientoEquipo = () => ( <Card> <CardHeader> <CardTitle className="flex items-center gap-2"><Icon name="Users" className="text-green-600"/>Tu Rendimiento vs. Equipo</CardTitle> </CardHeader> <CardContent className="text-sm text-center"> <p>Tu tiempo promedio de curse es de</p> <p className="text-4xl font-bold text-green-600 my-1">3 Días</p> <p className="font-semibold text-green-700">15% más rápido que el promedio del equipo. ¡Sigue así!</p> </CardContent> </Card> );
const Logros = ({ logros }) => ( <Card> <CardHeader> <CardTitle className="flex items-center gap-2"><Icon name="Award" className="text-yellow-500"/>Mis Logros Recientes</CardTitle> </CardHeader> <CardContent className="space-y-3"> {logros.map(logro => ( <div key={logro.titulo} className="flex items-center gap-3 text-sm"> <span className="text-2xl">{logro.emoji}</span> <div> <p className="font-semibold">{logro.titulo}</p> <p className="text-xs text-gray-500">{logro.descripcion}</p> </div> </div> ))} </CardContent> </Card> );
const ProcessTimeline = ({ steps, currentStep }) => ( <div> <h4 className="font-semibold text-gray-700 mb-3">Línea de Tiempo del Proceso</h4> <div className="flex justify-between items-center text-xs"> {steps.map((step, index) => { const stepIndex = steps.indexOf(step); const currentStepIndex = steps.indexOf(currentStep); const isCompleted = stepIndex < currentStepIndex; const isCurrent = step === currentStep; const color = isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'; const iconName = isCompleted ? 'Check' : 'HelpCircle'; return ( <React.Fragment key={step}> <div className="flex flex-col items-center text-center w-20"> <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${color} ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}> <Icon name={iconName} size={16}/> </div> <p className={`mt-1 font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>{step}</p> </div> {index < steps.length - 1 && <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>} </React.Fragment> ); })} </div> </div> );
const NotificationDropdown = ({ notifications, onClose }) => { const dropdownRef = useRef(null); useEffect(() => { const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { onClose(); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, [onClose]); const iconMap = { success: "CheckCircle", info: "MessageSquare", warning: "AlertTriangle" }; const colorMap = { success: "text-green-500", info: "text-blue-500", warning: "text-orange-500" }; return ( <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"> <div className="p-2"> <div className="px-2 py-1 font-semibold text-sm">Notificaciones</div> <ul className="max-h-80 overflow-y-auto"> {notifications.map(notif => ( <li key={notif.id} className="p-2 hover:bg-gray-100 rounded-md"> <div className="flex items-start gap-3"> <Icon name={iconMap[notif.type]} className={colorMap[notif.type]} size={20} /> <div className="text-xs"> <p className="text-gray-800" dangerouslySetInnerHTML={{__html: notif.message}}></p> <p className="text-gray-400">{notif.time}</p> </div> </div> </li> ))} </ul> </div> </div> ); };

// --- Componente principal del Dashboard ---
export default function Dashboard({ user, handleLogout }) {
    const navigate = useNavigate();
    
    const [operaciones, setOperaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeFilter, setActiveFilter] = useState('Todas');
    const [openActionMenuId, setOpenActionMenuId] = useState(null);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [lastLogin, setLastLogin] = useState(null);

    useEffect(() => {
        const fetchOperaciones = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                
                const response = await fetch('http://localhost:8000/api/operaciones', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'No se pudo conectar con el servidor.');
                }

                const data = await response.json();
                setOperaciones(data.operations || []);
                setLastLogin(data.last_login);
                setError(null);

            } catch (err) {
                console.error("Error al obtener datos:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOperaciones();
    }, [user]);

    const formatLastLogin = (dateString) => {
        if (!dateString) return "Este es tu primer ingreso.";
        const date = new Date(dateString);
        return `Tu último ingreso fue el ${date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const filteredData = useMemo(() => {
        if (activeFilter === 'Todas') return operaciones;
        return operaciones.filter(op => op.estado === activeFilter);
    }, [activeFilter, operaciones]);
    
    const kpis = useMemo(() => ({
        colocacionMensual: operaciones.filter(op => op.estado === "Verificada").reduce((sum, op) => sum + (op.moneda === "PEN" ? op.monto : op.monto * 3.75), 0),
        metaColocacion: 500000,
    }), [operaciones]);
    
    const logros = [ { emoji: '🏆', titulo: 'Maestro de la Meta', descripcion: 'Superaste tu meta en Mayo.' }, { emoji: '🚀', titulo: 'Impulso Inicial', descripcion: 'Registraste 5 operaciones esta semana.' } ];
    const notifications = [ { id: 1, type: "success", message: "<b>Verificación Aprobada:</b> La operación <b>OP-00124</b> ha sido verificada.", time: "hace 5 minutos" }];
    const filterOptions = ["Todas", "En Verificación", "Verificada", "Rechazada"];
    
    const handleNewOperationClick = () => {
        navigate('/new-operation');
    };

    const renderTableBody = () => {
        if (isLoading) return <tr><td colSpan="6" className="text-center py-16"><div className="flex justify-center items-center text-gray-500"><Icon name="Loader" className="animate-spin mr-3" size={24} />Cargando tus operaciones...</div></td></tr>;
        if (error) return <tr><td colSpan="6" className="text-center py-16 text-red-600"><Icon name="ServerCrash" size={32} className="mx-auto mb-2" /><p className="font-semibold">No se pudieron cargar los datos</p><p className="text-sm">{error}</p></td></tr>;
        if (filteredData.length === 0) return <tr><td colSpan="6" className="text-center text-gray-500 py-16"><Icon name="SearchX" size={40} className="mx-auto mb-2 opacity-50"/><p className="font-semibold">No se encontraron operaciones en este estado.</p></td></tr>;
        
        return filteredData.map(op => (
            <OperationRow
                key={op.id}
                operation={op}
                onActionMenuToggle={setOpenActionMenuId}
                isActionMenuOpen={openActionMenuId === op.id}
                setSelectedOperation={setSelectedOperation}
            />
        ));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mi Panel de Operaciones</h1>
                    <p className="text-lg text-gray-500">Bienvenido de vuelta, {user?.displayName?.split(' ')[0] || 'Usuario'} 👋</p>
                     {!isLoading && (
                         <div className="mt-2 flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md w-fit">
                            <Icon name="ShieldCheck" size={14} className="mr-1.5 text-green-600"/>
                            <span>{formatLastLogin(lastLogin)}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setIsNotificationsOpen(prev => !prev)}><Icon name="Bell" /></Button>
                        {isNotificationsOpen && <NotificationDropdown notifications={notifications} onClose={() => setIsNotificationsOpen(false)} />}
                    </div>
                     <Button variant="outline" iconName="LogOut" onClick={handleLogout}>Cerrar Sesión</Button>
                     <Button variant="default" iconName="PlusCircle" onClick={handleNewOperationClick}>Ingresar Nueva Operación</Button>
                </div>
            </header>
            
            <SugerenciasIA operaciones={operaciones} />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <CardTitle>Mis Operaciones Cargadas</CardTitle>
                                <CardDescription>Visualiza y gestiona el estado de tus operaciones.</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                                {filterOptions.map(option => (
                                   <Button key={option} variant={activeFilter === option ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter(option)}>{option}</Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente / Deudor</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Antigüedad</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestión</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-5 py-3 relative"><span className="sr-only">Acciones</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {renderTableBody()}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <aside className="lg:col-span-1 space-y-6">
                    <MetasPersonales kpis={kpis}/>
                    <RendimientoEquipo/>
                    <Logros logros={logros}/>
                </aside>
            </main>
            
            <Modal isOpen={!!selectedOperation} onClose={() => setSelectedOperation(null)} title={`Detalle Operación: ${selectedOperation?.id}`}>
                {selectedOperation && <OperationDetailModalContent operation={selectedOperation} />}
            </Modal>
        </div>
    );
}

// --- Componente Portal para el Menú de Acciones ---
const ActionMenuPortal = ({ children, onClose, menuPosition }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Usamos el portal para renderizar el menú fuera del DOM de la tabla
    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            style={{
                position: 'absolute',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
            }}
            className="z-50" // <-- z-index alto para estar por encima de todo
        >
            {children}
        </div>,
        document.body
    );
};

// --- Componente para una fila de la tabla de operaciones (CORREGIDO) ---
const OperationRow = ({ operation, onActionMenuToggle, isActionMenuOpen, setSelectedOperation }) => {
    const statusMap = { "En Verificación": { variant: 'warning', icon: 'Clock', text: 'En Verificación' }, "Verificada": { variant: 'success', icon: 'CheckCircle', text: 'Verificada' }, "Rechazada": { variant: 'error', icon: 'XCircle', text: 'Rechazada' }};
    const currentStatus = statusMap[operation.estado] || { variant: 'neutral', icon: 'HelpCircle', text: operation.estado };
    const formatCurrency = (value, currency) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: currency }).format(value);
    const calculateAntiquity = (dateString) => Math.ceil(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24)) || 0;
    const antiquity = calculateAntiquity(operation.fechaIngreso);
    const buttonRef = useRef(null); // Ref para el botón de tres puntos
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const handleMenuToggle = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX - 224, // Ajusta el valor para alinear el menú a la izquierda del botón
            });
        }
        onActionMenuToggle(isActionMenuOpen ? null : operation.id);
    };
    
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-5 py-4">
                <div className="font-semibold text-gray-900">{operation.cliente}</div>
                <div className="text-xs text-gray-500">{operation.id || 'N/A'}</div>
            </td>
            <td className="px-5 py-4 whitespace-nowrap font-semibold text-blue-600">
                {formatCurrency(operation.monto, operation.moneda)}
            </td>
            <td className="px-5 text-center py-4 whitespace-nowrap">
                <div className={`font-semibold ${antiquity > 15 ? 'text-red-600' : 'text-gray-800'}`}>{antiquity} días</div>
                <div className="text-xs  text-gray-500">{new Date(operation.fechaIngreso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
            </td>
             <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-gray-700">
                    <Icon name="Mail" size={16}/>
                    <span>{operation.gestionesVerificacion?.length || 0} Correo(s)</span>
                </div>
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
                <Badge variant={currentStatus.variant} iconName={currentStatus.icon}>
                    {currentStatus.text}
                </Badge>
            </td>
            <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button ref={buttonRef} variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-200" onClick={handleMenuToggle}>
                    <Icon name="MoreHorizontal" size={20}/>
                </Button>
                {isActionMenuOpen && (
                    <ActionMenuPortal onClose={() => onActionMenuToggle(null)} menuPosition={menuPosition}>
                        <div className="w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                            <div className="py-1" role="menu">
                                <button onClick={() => { setSelectedOperation(operation); onActionMenuToggle(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem"><Icon name="Eye" size={16}/> Ver Detalle Completo</button>
                                <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem"><Icon name="Send" size={16}/> Solicitar Verificación</button>
                                <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50" role="menuitem"><Icon name="Trash2" size={16}/> Solicitar Anulación</button>
                            </div>
                        </div>
                    </ActionMenuPortal>
                )}
            </td>
        </tr>
    );
};

// --- Componente para el contenido del Modal de Detalles ---
const OperationDetailModalContent = ({ operation }) => {
    const processSteps = ["Ingresada", "Verificando", "Cavali", "Cursada"];
    const etapaActual = operation.etapaActual || "Ingresada";

    return (
        <div className="space-y-6">
            <ProcessTimeline steps={processSteps} currentStep={etapaActual}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-6">
                <p><strong className="text-gray-500 block">ID Operación:</strong> {operation.id}</p>
                <p><strong className="text-gray-500 block">Fecha Ingreso:</strong> {new Date(operation.fechaIngreso).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                <p><strong className="text-gray-500 block">Cliente:</strong> {operation.cliente}</p>
                <p><strong className="text-gray-500 block">Deudor:</strong> {operation.deudor || 'N/A'}</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Acciones Rápidas</h4>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" iconName="Send" onClick={() => alert(`Simulando solicitud de verificación para ${operation.id}`)}>Solicitar Verificación</Button>
                    <Button variant="outline" size="sm" iconName="MessageSquare" onClick={() => alert(`Simulando añadir nota para ${operation.id}`)}>Añadir Nota</Button>
                </div>
            </div>
        </div>
    );
};