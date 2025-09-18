import React, { useState } from 'react';
import GestionarList from '../components/GestionarList';
import GestionModal from '../components/GestionModal';
import ConfirmModal from '../components/ConfirmModal';
import MessageModal from '../components/MessageModal';
import "../styles/0x_GestionarMedico.css";

export default function GestionarMedico() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [editingMedico, setEditingMedico] = useState(null);
  const [medicoToDelete, setMedicoToDelete] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [refreshKey, setRefreshKey] = useState(0);

  const API_URL = "http://127.0.0.1:8000/api/medicos/";

  const columns = [
    { key: 'medico', label: 'ID', sortable: true, width: '80px' },
    { key: 'numero_colegiado', label: 'Nro. Colegiado', sortable: true },
    { key: 'info_medico.nombre', label: 'Nombre', sortable: true },
    { key: 'info_medico.correo', label: 'Correo', sortable: true },
    { key: 'info_medico.telefono', label: 'Teléfono', sortable: true },
    { key: 'especialidades_nombres', label: 'Especialidades', sortable: false, render: (value) => value?.join(', ') || 'Ninguna' }
  ];

  const editFields = [
    { 
      key: 'numero_colegiado', 
      label: 'Número de Colegiado', 
      required: true,
      description: "Número oficial de colegiación del médico"
    },
    { 
      key: 'especialidades', 
      label: 'IDs de Especialidades', 
      placeholder: 'Ej: 1, 5, 7 (dejar vacío para ninguna)',
      description: "IDs numéricos de las especialidades, separados por comas"
    }
  ];

  const addFields = [
    { 
      key: 'nombre_usuario', 
      label: 'Nombre Completo', 
      required: true,
      placeholder: 'Ej: Leonel Messi'
    },
    { 
      key: 'correo_usuario', 
      label: 'Correo Electrónico', 
      type: 'email', 
      required: true,
      placeholder: 'ejemplo@clinica.com'
    },
    { 
      key: 'password_usuario', 
      label: 'Contraseña', 
      type: 'password', 
      required: true,
      description: "Mínimo 8 caracteres, incluyendo números y letras"
    },
    { 
      key: 'sexo_usuario', 
      label: 'Sexo', 
      placeholder: 'M o F', 
      required: true,
      description: "Ingrese M para masculino o F para femenino"
    },
    { 
      key: 'fecha_nacimiento_usuario', 
      label: 'Fecha de Nacimiento', 
      type: 'date', 
      required: true 
    },
    { 
      key: 'telefono_usuario', 
      label: 'Teléfono', 
      required: true,
      placeholder: 'Ej: 62143210'
    },
    { 
      key: 'direccion_usuario', 
      label: 'Dirección', 
      required: true,
      placeholder: 'Ej: Av. Copa del Mundo'
    },
    { 
      key: 'numero_colegiado', 
      label: 'Número de Colegiado', 
      required: true,
      placeholder: 'Ej: COL-8888',
      description: "Número oficial de colegiación"
    },
    { 
      key: 'especialidades', 
      label: 'IDs de Especialidades', 
      placeholder: 'Ej: 1, 2 (dejar vacío para ninguna)',
      description: "IDs numéricos de las especialidades, separados por comas"
    }
  ];

  const showMessage = (msg) => {
    setMessage(msg);
    setIsMessageModalOpen(true);
  };

  const handleEdit = (medico) => {
    const medicoParaEditar = {
      ...medico,
      especialidades: medico.especialidades && medico.especialidades.length > 0 
        ? medico.especialidades.join(', ') 
        : ''
    };
    
    setEditingMedico(medicoParaEditar);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (medico) => {
    setMedicoToDelete(medico);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!medicoToDelete) return;
    
    try {
      const response = await fetch(`${API_URL}${medicoToDelete.medico}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar el médico');
      }
      
      showMessage('Médico eliminado correctamente.');
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      showMessage(`Error: ${error.message}`);
    } finally {
      setIsConfirmModalOpen(false);
      setMedicoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsConfirmModalOpen(false);
    setMedicoToDelete(null);
  };

  const handleAdd = () => {
    setEditingMedico(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const procesarEspecialidades = (especialidadesStr) => {
    if (!especialidadesStr || typeof especialidadesStr !== 'string') {
      return [];
    }
    
    const str = especialidadesStr.trim();
    if (str === '') {
      return [];
    }
    
    return str
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));
  };
  
  const handleSave = async (formData) => {
    try {
      let payload;
      let url;
      let method;

      if (modalMode === 'edit') {
        // Para edición - solo los campos que se pueden modificar
        payload = {
          numero_colegiado: formData.numero_colegiado,
          especialidades: procesarEspecialidades(formData.especialidades)
        };
        
        url = `${API_URL}${editingMedico.medico}/`;
        method = 'PATCH';
      } else {
        // Para creación - estructura EXACTA que espera el backend
        payload = {
          nombre_usuario: formData.nombre_usuario,
          correo_usuario: formData.correo_usuario,
          password_usuario: formData.password_usuario,
          sexo_usuario: formData.sexo_usuario,
          fecha_nacimiento_usuario: formData.fecha_nacimiento_usuario,
          telefono_usuario: formData.telefono_usuario,
          direccion_usuario: formData.direccion_usuario,
          numero_colegiado: formData.numero_colegiado,
          especialidades: procesarEspecialidades(formData.especialidades)
        };

        // DEPURACIÓN: Mostrar el payload que se enviará
        console.log('Payload a enviar:', JSON.stringify(payload, null, 2));
        
        url = API_URL;
        method = 'POST';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      
      // Si la respuesta es exitosa pero vacía (como en algunos DELETE)
      if (response.status === 204 || responseText.trim() === '') {
        showMessage(modalMode === 'add' ? 'Médico creado exitosamente.' : 'Médico actualizado correctamente.');
        setIsModalOpen(false);
        setRefreshKey(prevKey => prevKey + 1);
        return;
      }
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // Si no es JSON, mostrar el error del servidor
        console.error('Error parsing response:', responseText);
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}. Respuesta: ${responseText.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        const errorMessage = responseData.message || 
                            responseData.detail || 
                            responseData.error || 
                            (typeof responseData === 'object' ? JSON.stringify(responseData) : responseData) ||
                            `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      showMessage(modalMode === 'add' ? 'Médico creado exitosamente.' : 'Médico actualizado correctamente.');
      setIsModalOpen(false);
      setRefreshKey(prevKey => prevKey + 1);
      
    } catch (error) {
      console.error('Error completo:', error);
      showMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="gestionar-medico-container">
      <GestionarList
        apiUrl={API_URL}
        title="Gestión de Médicos"
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAdd={handleAdd}
        refreshTrigger={refreshKey}
      />
      
      <GestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        item={editingMedico}
        fields={modalMode === 'add' ? addFields : editFields}
        title={modalMode === 'add' ? 'Agregar Nuevo Médico' : 'Editar Médico'}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar eliminación"
        message={medicoToDelete ? `¿Estás seguro de eliminar al médico ${medicoToDelete.info_medico.nombre}?` : ''}
      />
      
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        message={message}
      />
    </div>
  );
}