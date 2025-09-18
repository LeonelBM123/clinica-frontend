import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/form_patologias.css";

export default function CrearPatologia() {
  const [form, setForm] = useState({
    nombre: "",
    alias: "",
    descripcion: "",
    gravedad: "LEVE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const gravedadOpciones = ["LEVE", "MODERADA", "GRAVE", "CRITICA"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/patologias/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al registrar la patología");
      }
      navigate("/AdminLayout/patologias");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patologia-form-page">
      <div className="pf-header">
        <h2>Registrar Nueva Patología</h2>
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
          <div className="pf-field">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              maxLength={120}
              placeholder="Ej: Glaucoma"
            />
          </div>

          <div className="pf-field">
            <label htmlFor="alias">Alias *</label>
            <input
              id="alias"
              type="text"
              name="alias"
              value={form.alias}
              onChange={handleChange}
              required
              maxLength={120}
              placeholder="Nombre corto"
            />
          </div>

          <div className="pf-field pf-field-full">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Descripción clínica..."
            />
          </div>

            <div className="pf-field">
              <label htmlFor="gravedad">Gravedad *</label>
              <select
                id="gravedad"
                name="gravedad"
                value={form.gravedad}
                onChange={handleChange}
                required
              >
                {gravedadOpciones.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
        </div>

        {error && <div className="pf-alert pf-alert-error">{error}</div>}

        <div className="pf-actions">
          <button
            type="button"
            className="pf-btn pf-btn-secondary"
            onClick={() => navigate("/AdminLayout/patologias")}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="pf-btn" disabled={loading}>
            {loading ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
}