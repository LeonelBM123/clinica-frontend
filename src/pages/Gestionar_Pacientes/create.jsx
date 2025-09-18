import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/0x_GestionarMedico.css";

export default function CrearPaciente() {
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
      // Construimos el JSON según nuestro serializer
      const payload = {
        numero_historia_clinica: form.numero_historia_clinica,
        nombre: form.nombre,
        apellido: form.apellido,
        fecha_nacimiento: form.fecha_nacimiento,
        alergias: form.alergias,
        antecedentes_oculares: form.antecedentes_oculares,
        estado: form.estado,
        examen_ocular: {
          agudeza_visual: {
            derecho: form.agudeza_visual_derecho,
            izquierdo: form.agudeza_visual_izquierdo,
          },
          presion_intraocular: {
            derecho: parseFloat(form.presion_intraocular_derecho) || 0,
            izquierdo: parseFloat(form.presion_intraocular_izquierdo) || 0,
          },
          diagnostico_ocular: form.diagnostico_ocular,
        },
      };

      const res = await fetch("http://127.0.0.1:8000/api/pacientes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al registrar el paciente");
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
      <h2>Registrar Nuevo Paciente</h2>
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
            placeholder="Nombre del paciente"
          />
        </div>

        <div className="pf-field">
          <label htmlFor="apellido">Apellido</label>
          <input
            id="apellido"
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
            placeholder="Apellido del paciente"
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
