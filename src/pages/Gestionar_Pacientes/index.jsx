import React from "react";
import GestionarList from "../../components/GestionarList";
import "../../styles/0x_GestionarMedico.css";
import { useNavigate } from "react-router-dom";

export default function GestionarPacientes() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshTrigger] = React.useState(0);

  const columns = [
    { key: "id", label: "ID Paciente", sortable: true, width: "80px" }, // antes era paciente
    { key: "numero_historia_clinica", label: "N° Historia Clínica", sortable: true },
    { key: "nombre", label: "Nombres", sortable: false },
    { key: "apellido", label: "Apellidos", sortable: false },
    { key: "fecha_nacimiento", label: "fecha_nacimiento", sortable: false },
    { key: "alergias", label: "Alergias", sortable: false },
    { key: "antecedentes_oculares", label: "Antecedentes Oculares", sortable: false },
  ]

  const handleEdit = (paciente) => {
    navigate(`/AdminLayout/pacientes/${paciente.id}/editar`);
  };


  const handleDelete = async (paciente) => {
    if (!window.confirm(`¿Eliminar al paciente ${paciente.numero_historia_clinica}?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pacientes/${paciente.id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error eliminando paciente");
      // recargar lista
      setRefreshTrigger((k) => k + 1);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAdd = () => {
    navigate("/AdminLayout/pacientes/crear");
  };

  return (
    <div className="gestionar-pacientes-container">
      <GestionarList
        apiUrl="http://127.0.0.1:8000/api/pacientes"
        title="Gestión de Pacientes"
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        refreshKey={refreshKey}
      />
    </div>
  );
}
