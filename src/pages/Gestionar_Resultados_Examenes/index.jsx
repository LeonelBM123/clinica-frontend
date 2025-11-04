import React, { useState, useEffect } from "react";
import UniversalTable from "../../components/UniversalTable";
import ConfirmModal from "../../components/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/apiClient";
import { Outlet, useLocation } from "react-router-dom";

const GestionarResultadosExamenes = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    resultado: null,
  });
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Definir columnas de la tabla
  const columns = [
    { header: "Paciente", accessor: "paciente_nombre" },
    { header: "Médico", accessor: "medico_nombre" },
    { header: "Tipo Examen", accessor: "tipo_examen" },
    {
      header: "Estado",
      accessor: "estado",
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${
            item.estado === "PENDIENTE"
              ? "bg-yellow-100 text-yellow-800"
              : item.estado === "REVISADO"
              ? "bg-green-100 text-green-800"
              : item.estado === "ARCHIVADO"
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {item.estado}
        </span>
      ),
    },
    {
      header: "Archivo",
      accessor: "archivo_url",
      render: (item) =>
        item.archivo_url ? (
          <a href={item.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver archivo</a>
        ) : (
          <span className="text-gray-400">No disponible</span>
        ),
    },
  ];

  // Notificación
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Cargar resultados
  const loadResultados = async () => {
    try {
      setLoading(true);
      setError("");         
      const data = await api.get("/diagnosticos/resultados-examenes/");
      setResultados(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message || "Error al cargar resultados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResultados();
  }, []);

  // Navegar a crear
  const handleAdd = () => {
    navigate("/dashboard/resultados-examenes/nuevo");
  };

  // Navegar a editar
  const handleEdit = (resultado) => {
    navigate(`/dashboard/resultados-examenes/${resultado.id}/editar`);
  };

  // Abrir modal de confirmación para eliminar
  const handleDelete = (resultado) => {
    setDeleteModal({
      isOpen: true,
      resultado: resultado,
    });
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!deleteModal.resultado) return;

    try {
      setDeleting(true);
      await api.delete(`/diagnosticos/resultados-examenes/${deleteModal.resultado.id}/`);
      showNotification("Resultado eliminado correctamente");
      await loadResultados();
      setDeleteModal({ isOpen: false, resultado: null });
    } catch (error) {
      setError(error.message || "Error al eliminar resultado");
    } finally {
      setDeleting(false);
    }
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, resultado: null });
  };

  // Detecta si está en una ruta hija (crear/editar)
  const isFormRoute =
    location.pathname.includes("/dashboard/resultados-examenes/nuevo") ||
    location.pathname.match(/\/dashboard\/resultados-examenes\/\d+\/editar/);

  // Si está en una ruta hija, muestra el Outlet (formulario)
  if (isFormRoute) {
    return <Outlet />;
  }

  // Si no, muestra la tabla
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notificación */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-30 p-4 rounded-xl shadow-lg flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Resultados de Exámenes
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los resultados de exámenes clínicos
          </p>
        </div>

        {/* Tabla Universal */}
        <UniversalTable
          title="Lista de Resultados"
          data={resultados}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          searchPlaceholder="Buscar resultados..."
          addButtonText="Nuevo Resultado"
          showAddButton={true}
          emptyMessage="No hay resultados registrados"
        />

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Eliminar Resultado"
          message={`¿Estás seguro de que deseas eliminar el resultado de examen de "${deleteModal.resultado?.paciente_nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          loading={deleting}
        />
      </div>
    </div>
  );
};

export default GestionarResultadosExamenes;
