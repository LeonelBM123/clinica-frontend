import React, { useState, useEffect } from "react";
import UniversalTable from "../../components/UniversalTable";
import ConfirmModal from "../../components/ConfirmModal";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { api } from "../../services/apiClient";
import dayjs from "dayjs";

const GestionarCitasMedicas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, cita: null });

  const navigate = useNavigate();
  const location = useLocation();

  const columns = [
    { header: "Paciente", accessor: "paciente_nombre" },
    { header: "Médico", accessor: "medico_nombre" },
    {
      header: "Fecha y Hora",
      accessor: "fecha",
      render: (item) =>
        `${dayjs(item.fecha).format("DD/MM/YYYY")} a las ${item.hora_inicio}`,
    },
    {
      header: "Estado",
      accessor: "estado_cita",
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${
            item.estado_cita === "CONFIRMADA"
              ? "bg-green-100 text-green-800"
              : item.estado_cita === "PENDIENTE"
              ? "bg-yellow-100 text-yellow-800"
              : item.estado_cita === "COMPLETADA"
              ? "bg-blue-100 text-blue-800"
              : item.estado_cita === "CANCELADA"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.estado_cita}
        </span>
      ),
    },
  ];

  const loadCitas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.get("/citas_pagos/citas/");
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message || "Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitas();
  }, []);

  const handleAdd = () => navigate("/dashboard/citas-medicas/nuevo");
  const handleEdit = (cita) =>
    navigate(`/dashboard/citas-medicas/${cita.id}/editar`);
  const handleDelete = (cita) => setDeleteModal({ isOpen: true, cita: cita });

  const confirmDelete = async () => {
    if (!deleteModal.cita) return;
    try {
      await api.delete(`/citas_pagos/citas/${deleteModal.cita.id}/`);
      await loadCitas();
      setDeleteModal({ isOpen: false, cita: null });
    } catch (error) {
      setError(error.message || "Error al eliminar la cita");
    }
  };

  const cancelDelete = () => setDeleteModal({ isOpen: false, cita: null });

  const isFormRoute =
    location.pathname.includes("/nuevo") || location.pathname.match(/\/editar/);

  if (isFormRoute) {
    return <Outlet />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Citas Médicas</h1>
      <UniversalTable
        title="Lista de Citas"
        data={citas}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        searchPlaceholder="Buscar por paciente o médico..."
        addButtonText="Agendar Nueva Cita"
      />
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Eliminar Cita"
        message={`¿Estás seguro de que deseas eliminar esta cita?`}
        type="danger"
      />
    </div>
  );
};

export default GestionarCitasMedicas;
