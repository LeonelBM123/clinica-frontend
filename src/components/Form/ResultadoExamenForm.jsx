import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { api } from "../../services/apiClient";

// Opciones de tipo_examen ahora se obtienen dinámicamente
const TIPO_EXAMEN_OPTIONS = [
  { value: "Topografía Corneal", label: "Topografía Corneal" },
  { value: "OCT de Retina", label: "OCT de Retina" },
  { value: "OCT de Nervio Óptico", label: "OCT de Nervio Óptico" },
  { value: "Fotografía Segmento Anterior", label: "Fotografía Segmento Anterior" },
  { value: "Fotografía de Anexos", label: "Fotografía de Anexos" },
  { value: "Microscopía Especular", label: "Microscopía Especular" },
  { value: "Otro", label: "Otro" },
];

const ESTADO_OPTIONS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "REVISADO", label: "Revisado" },
  { value: "ARCHIVADO", label: "Archivado" },
];

export default function ResultadoExamenForm({
  initialResultado,
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    paciente: initialResultado?.paciente || "",
    medico: initialResultado?.medico || "",
    tipo_examen: initialResultado?.tipo_examen || "",
    archivo: null,
    observaciones: initialResultado?.observaciones || "",
    estado: initialResultado?.estado || "PENDIENTE",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    // Fetch pacientes
    api.get("/diagnosticos/pacientes/")
      .then((data) => setPacientes(data))
      .catch(() => setPacientes([]));
    // Fetch medicos
    api.get("/doctores/medicos/")
      .then((data) => setMedicos(data))
      .catch(() => setMedicos([]));
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "archivo") {
      setForm((f) => ({ ...f, archivo: files[0] }));
      if (files && files[0]) {
        setPreviewUrl(URL.createObjectURL(files[0]));
      } else {
        setPreviewUrl(null);
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("paciente", form.paciente);
    formData.append("medico", form.medico);
    formData.append("tipo_examen", form.tipo_examen);
    if (form.archivo) formData.append("archivo", form.archivo);
    formData.append("observaciones", form.observaciones);
    formData.append("estado", form.estado);
    // Debug: mostrar contenido del FormData
    for (let pair of formData.entries()) {
      console.log('FormData:', pair[0], pair[1]);
    }
    // ...no enviar fecha_examen
    onSubmit(formData);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
      {/* Paciente */}
      <div>
        <label className="block font-medium mb-1">Paciente *</label>
        <select
          name="paciente"
          value={form.paciente}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        >
          <option value="">Seleccione un paciente</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre || p.id}
            </option>
          ))}
        </select>
      </div>
      {/* Médico */}
      <div>
        <label className="block font-medium mb-1">Médico *</label>
        <select
          name="medico"
          value={form.medico}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        >
          <option value="">Seleccione un médico</option>
          {medicos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.usuario?.nombre || m.nombre || m.id}
            </option>
          ))}
        </select>
      </div>
      {/* Tipo de Examen */}
      <div>
        <label className="block font-medium mb-1">Tipo de Examen *</label>
        <select
          name="tipo_examen"
          value={form.tipo_examen}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        >
          <option value="">Seleccione tipo de examen</option>
          {TIPO_EXAMEN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {/* Archivo */}
      <div>
        <label className="block font-medium mb-1">Archivo (PDF, imagen, etc.)</label>
        <input
          type="file"
          name="archivo"
          accept=".pdf,image/*"
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        />
        {/* Vista previa de imagen seleccionada */}
        {previewUrl && (
          <div className="mt-2 flex justify-center">
            <img src={previewUrl} alt="Vista previa" style={{ maxWidth: "300px", maxHeight: "200px" }} />
          </div>
        )}
        {/* Archivo actual en modo edición */}
        {initialResultado?.archivo_url && (
          <div className="mt-2 text-sm text-gray-500">
            Archivo actual: <a href={initialResultado.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver archivo</a>
          </div>
        )}
      </div>
      {/* ...no mostrar campo de fecha_examen */}
      {/* Observaciones */}
      <div>
        <label className="block font-medium mb-1">Observaciones</label>
        <textarea
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        />
      </div>
      {/* Estado */}
      <div>
        <label className="block font-medium mb-1">Estado *</label>
        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        >
          {ESTADO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {/* Error */}
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {/* Botones */}
      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

ResultadoExamenForm.propTypes = {
  initialResultado: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
