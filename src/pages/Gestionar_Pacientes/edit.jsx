import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/0x_GestionarMedico.css";

export default function EditarPaciente() {
  const { id } = useParams(); // ID del paciente a editar
  const [form, setForm] = useState({
    numero_historia_clinica: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    alergias: "",
    antecedentes_oculares: "",
    // Examen ocular como campos separados
    agudeza_visual_derecho: "",
    agudeza_visual_izquierdo: "",
    presion_intraocular_derecho: "",
    presion_intraocular_izquierdo: "",
    diagnostico_ocular: "",
    estado: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar datos del paciente
useEffect(() => {
  const fetchPaciente = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pacientes/${id}/`);
      if (!res.ok) throw new Error("Paciente no encontrado");
      const data = await res.json();

    // Extraemos el primer examen si existe
          const examen = data.examenes?.[0] || {};

          setForm({
            usuario: data.usuario || "",
            numero_historia_clinica: data.numero_historia_clinica || "",
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            fecha_nacimiento: data.fecha_nacimiento || "",
            alergias: data.alergias || "",
            antecedentes_oculares: data.antecedentes_oculares || "",
            estado: data.estado ?? true,
            agudeza_visual_derecho: examen.agudeza_visual?.derecho || "",
            agudeza_visual_izquierdo: examen.agudeza_visual?.izquierdo || "",
            presion_intraocular_derecho: examen.presion_intraocular?.derecho || "",
            presion_intraocular_izquierdo: examen.presion_intraocular?.izquierdo || "",
            diagnostico_ocular: examen.diagnostico_ocular || "",
          });



    } catch (err) {
      setError(err.message);
    }
  };
  fetchPaciente();
}, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pacientes/${id}/`, {
        method: "PUT", // o PATCH si quieres actualizar parcialmente
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al actualizar el paciente");
      }
      navigate("/AdminLayout/pacientes");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="gestionar-medico-container">
    <div className="list-header">
      <h2>Registrar Editar Paciente</h2>
      <button
        type="button"
        className="pf-btn pf-btn-secondary"
        onClick={() => navigate(-1)}
      >
        Volver
      </button>
    </div>

    <form className="pf-form" onSubmit={handleSubmit} noValidate>
      <div className="pf-grid">
        {/* Datos del paciente */}
        <div className="pf-field">
          <label htmlFor="nombre">Nombres</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            placeholder="Nombres del paciente"
          />
        </div>

        <div className="pf-field">
          <label htmlFor="apellido">Apellidos</label>
          <input
            id="apellido"
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
            placeholder="Apellidos del paciente"
          />
        </div>

        <div className="pf-field">
          <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
          <input
            id="fecha_nacimiento"
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={handleChange}
          />
        </div>

        <div className="pf-field">
          <label htmlFor="numero_historia_clinica">N° Historia Clínica</label>
          <input
            id="numero_historia_clinica"
            type="text"
            name="numero_historia_clinica"
            value={form.numero_historia_clinica}
            onChange={handleChange}
            required
            maxLength={64}
          />
        </div>

        <div className="pf-field pf-field-full">
          <label htmlFor="alergias">Alergias a Medicamentos</label>
          <textarea
            id="alergias"
            name="alergias"
            value={form.alergias}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="pf-field pf-field-full">
          <label htmlFor="antecedentes_oculares">Antecedentes Oftalmológicos</label>
          <textarea
            id="antecedentes_oculares"
            name="antecedentes_oculares"
            value={form.antecedentes_oculares}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* Datos del examen ocular */}
        <div className="pf-field">
          <label htmlFor="agudeza_visual_derecho">Agudeza Visual (derecho)</label>
          <input
            id="agudeza_visual_derecho"
            type="text"
            name="agudeza_visual_derecho"
            value={form.agudeza_visual_derecho}
            onChange={handleChange}
          />
        </div>

        <div className="pf-field">
          <label htmlFor="agudeza_visual_izquierdo">Agudeza Visual (izquierdo)</label>
          <input
            id="agudeza_visual_izquierdo"
            type="text"
            name="agudeza_visual_izquierdo"
            value={form.agudeza_visual_izquierdo}
            onChange={handleChange}
          />
        </div>

        <div className="pf-field">
          <label htmlFor="presion_intraocular_derecho">Presión Intraocular (derecho)</label>
          <input
            id="presion_intraocular_derecho"
            type="number"
            step="0.01"
            name="presion_intraocular_derecho"
            value={form.presion_intraocular_derecho}
            onChange={handleChange}
          />
        </div>

        <div className="pf-field">
          <label htmlFor="presion_intraocular_izquierdo">Presión Intraocular (izquierdo)</label>
          <input
            id="presion_intraocular_izquierdo"
            type="number"
            step="0.01"
            name="presion_intraocular_izquierdo"
            value={form.presion_intraocular_izquierdo}
            onChange={handleChange}
          />
        </div>

        <div className="pf-field pf-field-full">
          <label htmlFor="diagnostico_ocular">Diagnóstico Ocular</label>
          <textarea
            id="diagnostico_ocular"
            name="diagnostico_ocular"
            value={form.diagnostico_ocular}
            onChange={handleChange}
            rows={3}
          />

            <div className="pf-field pf-field-checkbox">         
              <label>
                <input
                  type="checkbox"
                  name="estado"
                  checked={form.estado}
                  onChange={handleChange}
                />
                Activo
              </label>
            </div>
        </div>
      </div>
      {error && <div className="pf-alert pf-alert-error">{error}</div>}

      <div className="pf-actions">
        <button
          type="button"
          className="pf-btn pf-btn-secondary"
          onClick={() => navigate("/AdminLayout/pacientes")}
          disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="pf-btn" disabled={loading}>
          {loading ? "Guardando" : "Registrar"}
        </button>      
      </div>
    </form>
  </div>
);
}
