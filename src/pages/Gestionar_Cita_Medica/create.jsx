import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import CitaForm from "../../components/Form/CitaForm.jsx";
import { api } from "../../services/apiClient.js";

export default function CrearCitaMedica() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    setSaving(true);
    setError("");
    api
      .post("/citas_pagos/citas/", data)
      .then(() => {
        // Podrías pasar un estado en la navegación para mostrar una notificación
        navigate("/dashboard/citas-medicas");
        window.location.reload();  // Para asegurar que la tabla se actualice
      })
      .catch((e) =>
        setError(
          e.message ||
            "Error al agendar la cita. Verifique que todos los campos sean correctos y el horario siga disponible."
        )
      )
      .finally(() => setSaving(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con botón de volver */}
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
                Agendar Nueva Cita
              </h1>
              <p className="text-gray-600 mt-1">
                Seleccione el paciente, médico y horario disponible.
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">Error al Agendar</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Contenedor del Formulario */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Detalles de la Cita
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Complete los datos requeridos para la nueva cita.
            </p>
          </div>

          <div className="p-6">
            <CitaForm
              onSubmit={handleSubmit}
              onCancel={() => navigate("/dashboard/citas-medicas")}
              loading={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}