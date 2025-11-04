import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    User,
    Calendar,
    FileText,
    Activity,
    Eye,
    Stethoscope,
    Clock,
    AlertCircle,
    CheckCircle,
    Loader,
    Phone,
    MapPin,
    Mail,
    ArrowLeft,
    Search
} from "lucide-react";

// Componente de Lista de Pacientes
function ListaPacientes() {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}diagnosticos/pacientes/`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }

                const data = await res.json();
                setPacientes(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPacientes();
    }, [token]);

    const filteredPacientes = pacientes.filter((p) =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_historia_clinica?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Cargando pacientes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-200">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error</h2>
                    <p className="text-red-600 text-center">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Historias Clínicas</h1>
                    <p className="text-gray-600">Seleccione un paciente para ver su historia clínica completa</p>
                </div>

                {/* Barra de búsqueda */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, correo o historia clínica..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Lista de pacientes */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                            Lista de Pacientes
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {filteredPacientes.length} {filteredPacientes.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'}
                        </p>
                    </div>

                    {filteredPacientes.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No se encontraron pacientes</p>
                            <p className="text-gray-500 text-sm mt-2">
                                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay pacientes registrados'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredPacientes.map((paciente) => (
                                <div
                                    key={paciente.id}
                                    onClick={() => navigate(`/dashboard/historias-clinicas/${paciente.id}`)}
                                    className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <User className="w-7 h-7 text-white" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                    {paciente.nombre}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="w-4 h-4" />
                                                        <span>{paciente.numero_historia_clinica}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{paciente.correo}</span>
                                                    </div>
                                                    {paciente.fecha_nacimiento && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{new Date(paciente.fecha_nacimiento).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 ml-4">
                                            <div className="flex gap-4 text-sm">
                                                {(paciente.agudeza_visual_derecho || paciente.agudeza_visual_izquierdo) && (
                                                    <div className="text-center px-3 py-1 bg-blue-50 rounded-lg">
                                                        <div className="text-xs text-gray-500 mb-0.5">Agudeza Visual</div>
                                                        <div className="font-semibold text-blue-600 text-xs">
                                                            OD: {paciente.agudeza_visual_derecho || 'N/A'} | OI: {paciente.agudeza_visual_izquierdo || 'N/A'}
                                                        </div>
                                                    </div>
                                                )}
                                                {(paciente.presion_ocular_derecho || paciente.presion_ocular_izquierdo) && (
                                                    <div className="text-center px-3 py-1 bg-green-50 rounded-lg">
                                                        <div className="text-xs text-gray-500 mb-0.5">Presión Ocular</div>
                                                        <div className="font-semibold text-green-600 text-xs">
                                                            OD: {paciente.presion_ocular_derecho || 'N/A'} | OI: {paciente.presion_ocular_izquierdo || 'N/A'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                                Ver Historia →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Componente de Detalle de Historia Clínica
function DetalleHistoriaClinica() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [historia, setHistoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchHistoria = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}diagnosticos/pacientes/${id}/historia/`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }

                const data = await res.json();
                setHistoria(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoria();
    }, [id, token]);

    const formatDate = (dateString) => {
        if (!dateString) return "No especificado";
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getGravedadColor = (gravedad) => {
        const colors = {
            LEVE: "bg-green-100 text-green-800 border-green-200",
            MODERADA: "bg-yellow-100 text-yellow-800 border-yellow-200",
            GRAVE: "bg-red-100 text-red-800 border-red-200",
        };
        return colors[gravedad] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getEstadoExamen = (estado) => {
        const estados = {
            REVISADO: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
            PENDIENTE: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
            RECHAZADO: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        };
        return estados[estado] || { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-50" };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Cargando historia clínica...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-200">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error</h2>
                    <p className="text-red-600 text-center mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard/historias-clinicas')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    if (!historia) return null;

    const { paciente, patologias, resultados_examenes, total_patologias, total_resultados, ultimo_examen_en } = historia;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Botón volver */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard/historias-clinicas')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver a la lista</span>
                    </button>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Historia Clínica</h1>
                    <p className="text-gray-600">Información completa del paciente y registros médicos</p>
                </div>

                {/* Información del Paciente */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{paciente.usuario.nombre}</h2>
                            <p className="text-sm text-gray-500">HC: {paciente.numero_historia_clinica}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Correo Electrónico</p>
                                <p className="text-gray-900 font-medium">{paciente.usuario.correo}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Edad / Nacimiento</p>
                                <p className="text-gray-900 font-medium">
                                    {paciente.usuario.edad} años
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({formatDate(paciente.usuario.fecha_nacimiento)})
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <User className="w-5 h-5 text-pink-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Sexo</p>
                                <p className="text-gray-900 font-medium">
                                    {paciente.usuario.sexo === "M" ? "Masculino" : "Femenino"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                                <p className="text-gray-900 font-medium">{paciente.usuario.telefono || "No registrado"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl md:col-span-2">
                            <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Dirección</p>
                                <p className="text-gray-900 font-medium">{paciente.usuario.direccion || "No registrada"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Datos Oftalmológicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Agudeza Visual */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Agudeza Visual</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                                <span className="text-gray-700 font-medium">Ojo Derecho (OD)</span>
                                <span className="text-lg font-bold text-blue-600">{paciente.agudeza_visual_derecho || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                                <span className="text-gray-700 font-medium">Ojo Izquierdo (OI)</span>
                                <span className="text-lg font-bold text-purple-600">{paciente.agudeza_visual_izquierdo || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Presión Ocular */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Presión Ocular (mmHg)</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg">
                                <span className="text-gray-700 font-medium">Ojo Derecho (OD)</span>
                                <span className="text-lg font-bold text-green-600">{paciente.presion_ocular_derecho || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-transparent rounded-lg">
                                <span className="text-gray-700 font-medium">Ojo Izquierdo (OI)</span>
                                <span className="text-lg font-bold text-teal-600">{paciente.presion_ocular_izquierdo || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patologías */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Patologías</h3>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {total_patologias} {total_patologias === 1 ? "registro" : "registros"}
                        </span>
                    </div>

                    {patologias.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <p className="text-gray-600">No tiene patologías registradas</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {patologias.map((patologia) => (
                                <div key={patologia.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="text-lg font-bold text-gray-900">{patologia.nombre}</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getGravedadColor(patologia.gravedad)}`}>
                                            {patologia.gravedad}
                                        </span>
                                    </div>

                                    {patologia.descripcion && (
                                        <p className="text-gray-600 text-sm mb-3">{patologia.descripcion}</p>
                                    )}

                                    {patologia.tratamientos.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Tratamientos:</p>
                                            <div className="space-y-2">
                                                {patologia.tratamientos.map((tratamiento) => (
                                                    <div key={tratamiento.id} className="flex items-start gap-2 text-sm">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                                        <div>
                                                            <span className="text-gray-900 font-medium">{tratamiento.nombre}</span>
                                                            {tratamiento.duracion_dias && (
                                                                <span className="text-gray-500 ml-2">
                                                                    ({tratamiento.duracion_dias} días)
                                                                </span>
                                                            )}
                                                            {tratamiento.descripcion && (
                                                                <p className="text-gray-600 mt-1">{tratamiento.descripcion}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resultados de Exámenes */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Resultados de Exámenes</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                {total_resultados} {total_resultados === 1 ? "examen" : "exámenes"}
                            </span>
                            {ultimo_examen_en && (
                                <span className="text-sm text-gray-500">
                                    Último: {formatDate(ultimo_examen_en)}
                                </span>
                            )}
                        </div>
                    </div>

                    {resultados_examenes.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No hay exámenes disponibles</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo de Examen</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Médico</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Observaciones</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Archivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultados_examenes.map((examen) => {
                                        const estadoInfo = getEstadoExamen(examen.estado);
                                        const EstadoIcon = estadoInfo.icon;
                                        return (
                                            <tr key={examen.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <span className="font-medium text-gray-900">{examen.tipo_examen}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm">
                                                        <p className="text-gray-900">
                                                            {examen.medico ? `ID: ${examen.medico.usuario}` : "—"}
                                                        </p>
                                                        {examen.medico && (
                                                            <p className="text-gray-500">{examen.medico.especialidad}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${estadoInfo.bg}`}>
                                                        <EstadoIcon className={`w-4 h-4 ${estadoInfo.color}`} />
                                                        <span className={`text-sm font-medium ${estadoInfo.color}`}>
                                                            {examen.estado}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {formatDate(examen.fecha_creacion)}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {examen.observaciones || "—"}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {examen.archivo_url ? (
                                                        <a
                                                            href={examen.archivo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                                                        >
                                                            Ver archivo
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Sin archivo</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer con fechas de registro */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Registro creado: {formatDate(paciente.fecha_creacion)}</p>
                    <p>Última modificación: {formatDate(paciente.fecha_modificacion)}</p>
                </div>
            </div>
        </div>
    );
}

// Componente Principal que maneja el routing
export default function GestionarHistoriasClinicas() {
    const { id } = useParams();

    // Si hay un ID en la URL, mostrar el detalle
    if (id) {
        return <DetalleHistoriaClinica />;
    }

    // Si no hay ID, mostrar la lista
    return <ListaPacientes />;
}