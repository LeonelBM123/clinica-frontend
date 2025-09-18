import React from "react";
import GestionarList from "../../components/GestionarList";
import "../../styles/0x_GestionarMedico.css";
import { useNavigate } from "react-router-dom";

export default function GestionarPatologias() {

  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const columns = [
    { key: "id", label: "ID", sortable: true, width: "80px" },
    { key: "nombre", label: "Nombre", sortable: true },
    { key: "alias", label: "Alias", sortable: true },
    { key: "descripcion", label: "Descripción", sortable: false },
    { key: "gravedad", label: "Gravedad", sortable: true },
  ];


  const handleEdit = (patologia) => {
    navigate(`/AdminLayout/patologias/${patologia.id}/editar`);
  };

  const handleDelete = async (patologia) => {
    if (!window.confirm(`¿Eliminar la patología ${patologia.nombre}?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/patologias/${patologia.id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error eliminando");
      // recargar lista (incrementa clave para que GestionarList rehaga fetch)
      setRefreshKey(k => k + 1);
    } catch (e) {
      alert(e.message);
    }
  };

    const handleAdd = () => {
    navigate("/AdminLayout/patologias/crear");
  };

  return (
    <div className="gestionar-patologia-container">
      <GestionarList
        apiUrl="http://127.0.0.1:8000/api/patologias"
        title="Gestión de Patologías"
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        refreshKey={refreshKey} 
      />
    </div>
  );
}
