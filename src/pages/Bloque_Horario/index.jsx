import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { PlusCircle } from "lucide-react";
import { api } from "../../services/apiClient";
import ConfirmModal from "../../components/ConfirmModal";
import AgendaSemanal from "../../components/AgendaSemanal";
dayjs.locale("es");

const DIAS_SEMANA = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

const GestionarBloqueHorario = () => {
  const [bloques, setBloques] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bloque: null,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const bloquesData = await api.get("/doctores/bloques-horarios/");
      setBloques(Array.isArray(bloquesData) ? bloquesData : []);

      const citasData = await api.get("/citas_pagos/citas/");
      setCitas(Array.isArray(citasData) ? citasData : []);
    } catch (e) {
      console.error("Error al cargar datos:", e);
      setError(e.message || "Error al cargar los datos de la agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const citasPorDia = useMemo(() => {
    const agrupadas = {};
    const hoy = dayjs();
    const inicioSemana = hoy.startOf("week");
    citas.forEach((cita) => {
      const fechaCita = dayjs(cita.fecha);
      if (
        fechaCita.isAfter(inicioSemana.subtract(1, "day")) &&
        fechaCita.isBefore(inicioSemana.add(7, "day"))
      ) {
        const dayIndex = fechaCita.day();
        const dia = DIAS_SEMANA[dayIndex === 0 ? 6 : dayIndex - 1];
        if (dia) {
          if (!agrupadas[dia]) agrupadas[dia] = [];
          agrupadas[dia].push(cita);
        }
      }
    });
    return agrupadas;
  }, [citas]);

  const bloquesPorDia = useMemo(() => {
    const agrupados = {};
    bloques.forEach((bloque) => {
      if (!agrupados[bloque.dia_semana]) agrupados[bloque.dia_semana] = [];
      agrupados[bloque.dia_semana].push(bloque);
      agrupados[bloque.dia_semana].sort((a, b) =>
        a.hora_inicio.localeCompare(b.hora_inicio)
      );
    });
    return agrupados;
  }, [bloques]);

  const handleEdit = (bloque) =>
    navigate(`/dashboard/bloques-horarios/${bloque.id}/editar`);
  const handleDelete = (bloque) =>
    setDeleteModal({ isOpen: true, bloque: bloque });
  const confirmDelete = async () => {
    if (!deleteModal.bloque) return;
    try {
      await api.delete(`/doctores/bloques-horarios/${deleteModal.bloque.id}/`);
      setDeleteModal({ isOpen: false, bloque: null });
      loadData();
    } catch (e) {
      setError(e.message || "Error al eliminar");
    }
  };

  const isFormRoute =
    location.pathname.includes("/nuevo") || location.pathname.match(/\/editar/);
  if (isFormRoute) {
    return <Outlet />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mi Agenda Semanal
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza y gestiona tu horario recurrente y las citas de esta
            semana.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/bloques-horarios/nuevo")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={20} /> Nuevo Bloque Horario
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Novedad: Usamos el nuevo componente y le pasamos las props */}
      <AgendaSemanal
        citasPorDia={citasPorDia}
        bloquesPorDia={bloquesPorDia}
        loading={loading}
        onEditBloque={handleEdit}
        onDeleteBloque={handleDelete}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, bloque: null })}
        onConfirm={confirmDelete}
        title="Eliminar Bloque Horario"
        message={`¿Estás seguro de eliminar el bloque de ${
          deleteModal.bloque?.dia_semana
        } de ${deleteModal.bloque?.hora_inicio.substring(
          0,
          5
        )} a ${deleteModal.bloque?.hora_fin.substring(0, 5)}?`}
        type="danger"
      />
    </div>
  );
};

export default GestionarBloqueHorario;
