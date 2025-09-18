import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/form_patologias.css";

export default function EditarPatologia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    alias: "",
    descripcion: "",
    gravedad: "LEVE",
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const gravedadOpciones = ["LEVE", "MODERADA", "GRAVE", "CRITICA"];

  // Cargar datos existentes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const res = await fetch(`http://127.0.0.1:8000/api/patologias/${id}/`);
        if (!res.ok) throw new Error("No se pudo cargar la patología");
        const data = await res.json();
        setForm({
          nombre: data.nombre || "",
            alias: data.alias || "",
            descripcion: data.descripcion || "",
            gravedad: data.gravedad || "LEVE",
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/patologias/${id}/`, {
        method: "PUT", // o "PATCH" si quieres parcial
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al actualizar");
      }
      navigate("/AdminLayout/patologias");
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="patologia-form-page"><p>Cargando...</p></div>;

  return (
    <div className="patologia-form-page">
      <div className="pf-header">
        <h2>Editar Patología #{id}</h2>
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
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              maxLength={120}
            />
          </div>

          <div className="pf-field">
            <label htmlFor="alias">Alias *</label>
            <input
              id="alias"
              name="alias"
              value={form.alias}
              onChange={handleChange}
              required
              maxLength={120}
            />
          </div>

          <div className="pf-field pf-field-full">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={5}
              value={form.descripcion}
              onChange={handleChange}
              required
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
              {gravedadOpciones.map(g => (
                <option key={g} value={g}>{g}</option>
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
            disabled={guardando}
          >
            Cancelar
          </button>
          <button type="submit" className="pf-btn" disabled={guardando}>
            {guardando ? "Guardando..." : "Actualizar"}
          </button>
        </div>
      </form>
    </div>
  );
}