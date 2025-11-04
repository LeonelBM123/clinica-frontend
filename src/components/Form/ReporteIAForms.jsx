import React, { useState } from "react";
import { api } from "../../services/apiClient";
import { Loader, Copy, ClipboardPaste, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

// Componente de Campo genérico
function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Componente para la sección de Reporte Médico con IA
 * @param {object} props
 * @param {number} props.citaId - El ID de la cita actual
 * @param {string} props.initialReporte - El texto del reporte guardado en la BD
 * @param {function(string): void} props.onReporteChange - Callback para actualizar el estado en CitaForm
 */
export default function SeccionReporteIA({ citaId, initialReporte, onReporteChange }) {
  // Estado para las notas vagas
  const [notasVagas, setNotasVagas] = useState("");
  // Estado para el reporte (se inicializa con el de la BD)
  const [reporte, setReporte] = useState(initialReporte || "");
  // Estado para el "Botón 2" (guardado local)
  const [ultimoGenerado, setUltimoGenerado] = useState("");
  
  // Estados de UX
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState(null);
  const [notify, setNotify] = useState(null);

  // Sincroniza el estado local con el padre (CitaForm)
  const handleReporteChange = (e) => {
    const newText = e.target.value;
    setReporte(newText);
    onReporteChange(newText); // Actualiza CitaForm
  };

  const showNotification = (message, type = "success") => {
    setNotify({ message, type });
    setTimeout(() => setNotify(null), 2500);
  };
  
  // Botón 1: Generar Reporte (llama a la IA)
  const handleGenerarReporte = async () => {
    setLoadingIA(true);
    setErrorIA(null);
    try {
      const endpoint = `/citas_pagos/citas/${citaId}/generar-reporte-ia/`;
      const response = await api.post(endpoint, { notas_vagas: notasVagas });
      
      const textoGenerado = response.reporte_generado;
      setReporte(textoGenerado);      // Actualiza el textarea principal
      onReporteChange(textoGenerado); // Actualiza el CitaForm
      setUltimoGenerado(textoGenerado); // Guarda para el "Botón 2"
      showNotification("Reporte generado por IA.", "success");

    } catch (e) {
      setErrorIA(e.message || "Error al conectar con la IA.");
    } finally {
      setLoadingIA(false);
    }
  };

  // Botón 2: Obtener Último Reporte (recupera el borrador de IA)
  const handleRecuperarUltimo = () => {
    if (ultimoGenerado) {
      setReporte(ultimoGenerado);
      onReporteChange(ultimoGenerado);
      showNotification("Borrador anterior recuperado.", "info");
    } else {
      showNotification("No hay un borrador de IA para recuperar.", "info");
    }
  };

  // Botón 3: Copiar
  const handleCopiar = () => {
    if (!reporte) return;
    navigator.clipboard.writeText(reporte);
    showNotification("¡Texto copiado al portapapeles!", "info");
  };

  // Botón 4: Pegar
  const handlePegar = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setReporte(text);
      onReporteChange(text);
      showNotification("Texto pegado desde el portapapeles.", "info");
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      setErrorIA("No se pudo leer el portapapeles. Verifique los permisos.");
    }
  };
  
  // La función handleGuardarReporte (Botón 5) ha sido eliminada.

  return (
    // Aplicamos los estilos de tu formulario (bordes, fondos)
    <div className="col-span-full space-y-6 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800">Reporte Médico (Asistido por IA)</h3>
      
      {/* Input de Notas Vagas */}
      <Field label="1. Notas Vagas (Opcional)">
        <textarea
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Ej: Pte 55a, DM1 20a evol. Mal ctrl. AV 20/60 AO..."
          value={notasVagas}
          onChange={(e) => setNotasVagas(e.target.value)}
          disabled={loadingIA}
        />
      </Field>

      {/* Textarea Principal del Reporte */}
      <Field label="2. Reporte Preliminar (Editable)">
        <textarea
          rows={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white font-mono text-sm"
          placeholder="El reporte generado por la IA aparecerá aquí..."
          value={reporte}
          onChange={handleReporteChange}
          disabled={loadingIA}
        />
      </Field>

      {/* Notificaciones y Errores */}
      {errorIA && (
        <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={16} /> {errorIA}
        </div>
      )}
      {notify && (
        <div className={`text-sm ${notify.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
            {notify.message}
        </div>
      )}

      {/* Barra de Botones de Acción */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerarReporte}
          disabled={loadingIA || !notasVagas}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loadingIA ? (
            <Loader className="animate-spin" size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          {loadingIA ? 'Generando...' : 'Generar Reporte'}
        </button>
        
        {/* El Botón 5 "Guardar Reporte" ha sido eliminado */}

        <div className="flex-grow"></div> 
        
        {/* Botón 2 */}
        <button
          type="button"
          onClick={handleRecuperarUltimo}
          disabled={!ultimoGenerado || loadingIA}
          title="Recuperar último borrador generado por IA"
          className="p-2 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw size={18} />
        </button>
        
        {/* Botón 3 */}
        <button
          type="button"
          onClick={handleCopiar}
          disabled={!reporte || loadingIA}
          title="Copiar reporte al portapapeles"
          className="p-2 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <Copy size={18} />
        </button>

        {/* Botón 4 */}
        <button
          type="button"
          onClick={handlePegar}
          disabled={loadingIA}
          title="Pegar desde el portapapeles"
          className="p-2 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <ClipboardPaste size={18} />
        </button>
      </div>
    </div>
  );
}