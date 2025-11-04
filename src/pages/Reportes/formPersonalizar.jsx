import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Calendar,
  List,
  FileDown,
  XCircle,
  BarChart3, 
} from "lucide-react";
import { api } from "../../services/apiClient.js";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL;//"http://localhost:8000/api";

//función Helper para formatear fechas
const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

//valores por defecto para las fechas
const getFechasDefault = (tipo) => {
  const fechaFin = new Date();
  const fechaInicio = new Date();

  if (tipo === 'pacientes') {
    // Para pacientes, por defecto es el año actual
    fechaInicio.setDate(1);
    fechaInicio.setMonth(0);
  } else {
    // Para citas, por defecto son 30 días
    fechaInicio.setDate(fechaFin.getDate() - 29);
  }
  
  return {
    inicio: formatDate(fechaInicio),
    fin: formatDate(fechaFin),
  };
};

// --- Objeto de configuración para cada tipo de reporte ---
const configReportes = {
  citas: {
    titulo: "Dashboard de Citas",
    descripcion: "Reportes dinámicos de la actividad de citas de la clínica.",
    urlApiJson: "/reportes/citas_dia/",
    urlApiExcel: "/reportes/citas_excel/", 
    nombreArchivoExcel: "reporte_citas",
    defaultFechas: getFechasDefault('citas')
  },
  pacientes: {
    titulo: "Dashboard de Pacientes",
    descripcion: "Reportes dinámicos sobre el crecimiento de pacientes.",
    urlApiJson: "/reportes/pacientes_fechas/",
    urlApiExcel: "/reportes/pacientes_excel/",
    nombreArchivoExcel: "reporte_pacientes_nuevos",
    defaultFechas: getFechasDefault('pacientes')
  },
};


export default function FormPersonalizar() {
  const navigate = useNavigate();
  const { tipoReporte } = useParams(); 
  
  const config = configReportes[tipoReporte];

  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [listaDetalles, setListaDetalles] = useState([]); 
  
  // Estado de fechas
  const [fechas, setFechas] = useState(config ? config.defaultFechas : getFechasDefault('citas'));
  
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  //cargar losdatos
  const fetchData = useCallback(async () => {
    if (!config) {
      setError(`El tipo de reporte "${tipoReporte}" no es válido o no está disponible.`);
      return;
    }

    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      fecha_inicio: fechas.inicio,
      fecha_fin: fechas.fin,
    }).toString();

    try {
      const responseData = await api.get(`${config.urlApiJson}?${params}`);
      
      const lista = responseData.lista_citas || responseData.lista_pacientes;

      if (responseData && responseData.datos_grafico && lista) {
        setDatosGrafico(Array.isArray(responseData.datos_grafico) ? responseData.datos_grafico : []);
        setListaDetalles(Array.isArray(lista) ? lista : []);
      } else {
        setDatosGrafico([]);
        setListaDetalles([]);
      }
    } catch (e) {
      console.error("Error cargando datos del dashboard:", e);
      setError("No se pudieron cargar los datos: " + e.message);
      setDatosGrafico([]);
      setListaDetalles([]);
    } finally {
      setLoading(false);
    }
  }, [fechas, config, tipoReporte]);

  // Cargar datos al inicio y cuando las fechas o el tipo de reporte cambian
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Actualizar fechas si cambia el tipo de reporte
  useEffect(() => {
    if (config) {
      setFechas(config.defaultFechas);
    }
  }, [tipoReporte, config]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFechas((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescargarExcel = async () => {
    if (!config) return;

    setIsDownloadingExcel(true);
    setError("");

    const params = new URLSearchParams({
      fecha_inicio: fechas.inicio,
      fecha_fin: fechas.fin,
    }).toString();
    
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}${config.urlApiExcel}?${params}`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: token ? `Token ${token}` : "" },
        responseType: "blob",
      });

      const file = new Blob([response.data], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      const fileName = `${config.nombreArchivoExcel}_${fechas.inicio}_a_${fechas.fin}.xlsx`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      URL.revokeObjectURL(fileURL);

    } catch (e) {
      console.error("Error al descargar el Excel:", e);
      let errorMsg = e.message;
      if (e.response && e.response.data && e.response.data.toString() === '[object Blob]') {
        try {
          const errorBlobText = await e.response.data.text();
          errorMsg = errorBlobText;
        } catch(readError) {
          errorMsg = "Error indescifrable al descargar el archivo."
        }
      } else if(e.response && e.response.data) {
        errorMsg = e.response.data.detail || e.response.data.toString();
      }
      setError(`No se pudo generar el Excel: ${errorMsg}`);
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Volver</span>
              </button>
            </div>
          </div>
          <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-4">
            <XCircle className="text-red-600 flex-shrink-0" size={40} />
            <div>
              <h3 className="text-red-800 text-2xl font-semibold">
                Reporte no disponible
              </h3>
              <p className="text-red-600 text-lg mt-1">
                El dashboard personalizado para <b>"{tipoReporte}"</b> aún no ha sido creado.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {config.titulo}
              </h1>
              <p className="text-gray-600 mt-1">
                {config.descripcion}
              </p>
            </div>
          </div>
        </div>

        {/* Error*/}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">
                Error al cargar el reporte
              </h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/*controles de fechas*/}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="inicio" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                id="inicio"
                name="inicio"
                value={fechas.inicio}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="fin" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                id="fin"
                name="fin"
                value={fechas.fin}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>


        {/*dashboard de citas*/}
        {tipoReporte === 'citas' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Citas por Día</h2>
                <p className="text-gray-600 text-sm mt-1">Volumen de citas registradas en el rango de fechas.</p>
              </div>
              <div className="p-6 h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Loader2 size={40} className="animate-spin" />
                  </div>
                ) : datosGrafico.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Total de Citas" stroke="#004A99" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Calendar size={40} />
                    <p className="ml-4 text-lg">No hay datos de citas para este rango de fechas.</p>
                  </div>
                )}
              </div>
            </div>

            {/*lista de Citas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detalle de Citas en el Rango</h2>
                  <p className="text-gray-600 text-sm mt-1">Mostrando las últimas {listaDetalles.length} citas del rango seleccionado.</p>
                </div>
                <button
                  onClick={handleDescargarExcel}
                  disabled={isDownloadingExcel || loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3 sm:mt-0"
                >
                  {isDownloadingExcel ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                  <span>{isDownloadingExcel ? "Generando..." : "Descargar Excel"}</span>
                </button>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-48 text-gray-500"><Loader2 size={32} className="animate-spin" /></div>
                ) : listaDetalles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {listaDetalles.map((cita) => (
                          <tr key={cita.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{cita.fecha}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{cita.hora_inicio}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cita.paciente}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{cita.estado}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{cita.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-500">
                    <List size={32} /><p className="ml-4 text-lg">No se encontraron citas detalladas.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/*dashboard de pacientes*/}
        {tipoReporte === 'pacientes' && (
          <>
            {/* Tarjeta del Gráfico */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Pacientes Nuevos por Mes</h2>
                <p className="text-gray-600 text-sm mt-1">Volumen de pacientes registrados en el rango de fechas.</p>
              </div>
              <div className="p-6 h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Loader2 size={40} className="animate-spin" />
                  </div>
                ) : datosGrafico.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {/* Gráfico de Barras para pacientes */}
                    <BarChart data={datosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Pacientes Nuevos" fill="#004A99" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Calendar size={40} />
                    <p className="ml-4 text-lg">No hay datos de pacientes para este rango de fechas.</p>
                  </div>
                )}
              </div>
            </div>

            {/*Lista de Pacientes */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detalle de Pacientes Nuevos</h2>
                  <p className="text-gray-600 text-sm mt-1">Mostrando los últimos {listaDetalles.length} pacientes del rango.</p>
                </div>
                <button
                  onClick={handleDescargarExcel}
                  disabled={isDownloadingExcel || loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3 sm:mt-0"
                >
                  {isDownloadingExcel ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                  <span>{isDownloadingExcel ? "Generando..." : "Descargar Excel"}</span>
                </button>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-48 text-gray-500"><Loader2 size={32} className="animate-spin" /></div>
                ) : listaDetalles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Historia</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {listaDetalles.map((paciente) => (
                          <tr key={paciente.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{paciente.fecha_registro}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paciente.nombre}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.correo}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.historia_clinica}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-500">
                    <List size={32} /><p className="ml-4 text-lg">No se encontraron pacientes detallados.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

