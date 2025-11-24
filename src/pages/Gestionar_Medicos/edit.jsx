import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import MedicoForm from "../../components/Form/MedicoForm.jsx";
import { api } from "../../services/apiClient.js";

export default function EditarMedico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    // Cargar datos del médico y especialidades en paralelo
    Promise.all([
      api.get(`/doctores/medicos/${id}/`),
      api.get("/doctores/especialidades/")
    ])
      .then(([medicoData, especialidadesData]) => {
        setFormData(medicoData);
        setEspecialidades(Array.isArray(especialidadesData) ? especialidadesData : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSubmit(data) {
    setSaving(true);
    setError("");
    api
      .patch(`/doctores/medicos/${id}/`, data)
      .then(() => {
        navigate("/dashboard/medicos");
        window.location.reload();
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cargando médico...
              </h3>
              <p className="text-gray-600">Por favor espere un momento</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Editar Médico
              </h1>
              <p className="text-gray-600 mt-1">
                Modificando médico <span className="font-medium">#{id}</span>
                {formData?.nombre && ` - ${formData.nombre}`}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">
                Error al editar médico
              </h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Información del Médico
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Actualice los datos del médico
            </p>
          </div>

          <div className="p-6">
            <MedicoForm
              initialMedico={formData}
              especialidadesOptions={especialidades}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/dashboard/medicos")}
              loading={saving}
              isEditMode={true}
            />
          </div>
        </div>

        {/* Footer informativo */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Los cambios se guardarán automáticamente al enviar el formulario
          </p>
        </div>
      </div>
    </div>
  );
}
