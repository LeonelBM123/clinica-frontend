import { useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { api } from "../../services/apiClient";
import dayjs from "dayjs";
import authService from "../../services/auth";
import SeccionReporteIA from "./ReporteIAForms.jsx"; 

const ESTADOS_CITA_OPTIONS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "COMPLETADA", label: "Completada" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "NO_ASISTIO", label: "No Asistió" },
];

function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function CitaForm({
  initialCita = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEditMode = !!initialCita;
  const user = authService.getCurrentUser();
  const isUserMedico = authService.isMedico();

  const [pacientesOptions, setPacientesOptions] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [fecha, setFecha] = useState(
    initialCita?.fecha || dayjs().format("YYYY-MM-DD")
  );
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const [form, setForm] = useState({
    paciente: null,
    bloque_horario:
      initialCita?.bloque_horario_id || initialCita?.bloque_horario || null,
    hora_inicio: initialCita?.hora_inicio || "",
    notas: initialCita?.notas || "",
    estado_cita: initialCita?.estado_cita || "PENDIENTE",
    reporte: initialCita?.reporte || "", // Se inicializa con el reporte de la BD
  });

  const [touched, setTouched] = useState({});

  useEffect(() => {
    setLoadingPacientes(true);
    api
      .get("/diagnosticos/pacientes/?busqueda_global=false")
      .then((data) => {
        const options = data.map((paciente) => ({
          label: `${paciente.nombre} (${paciente.numero_historia_clinica})`,
          value: paciente.id,
        }));
        setPacientesOptions(options);
        if (isEditMode && initialCita) {
          const pacienteSeleccionado = options.find(
            (opt) => opt.value === initialCita.paciente
          );
          setForm((f) => ({ ...f, paciente: pacienteSeleccionado }));
        }
      })
      .catch((e) => console.error("Error cargando pacientes:", e))
      .finally(() => setLoadingPacientes(false));
  }, [isEditMode, initialCita]);

  useEffect(() => {
    if (isUserMedico) {
      api
        .get(`/cuentas/usuarios/${user.usuario_id}/`)
        .then((medicoData) => {
          setSelectedMedico({ label: medicoData.nombre, value: medicoData.id });
        })
        .catch((e) =>
          console.error("Error cargando datos del médico logueado", e)
        );
    }
  }, [isUserMedico, user]);

  const loadMedicos = async (inputValue) => {
    const params = { search: inputValue };
    const data = await api.get("/doctores/medicos/", { params });
    return data.map((medico) => ({ label: medico.nombre, value: medico.id }));
  };

  useEffect(() => {
    if (selectedMedico?.value && fecha) {
      setLoadingHorarios(true);
      setHorarios([]);

      if (!isEditMode) {
        setForm((f) => ({ ...f, hora_inicio: "", bloque_horario: null }));
      }

      api
        .get(
          `/doctores/medicos/${selectedMedico.value}/horarios-disponibles/?fecha=${fecha}`
        )
        .then((data) => {
          let horariosDisponibles = Array.isArray(data) ? data : [];
          if (isEditMode && initialCita?.fecha === fecha) {
            const horaOriginalExiste = horariosDisponibles.some(
              (h) => h.hora_inicio === initialCita.hora_inicio
            );
            if (!horaOriginalExiste) {
              const horarioOriginal = {
                hora_inicio: initialCita.hora_inicio,
                bloque_horario_id:
                  initialCita.bloque_horario_id || initialCita.bloque_horario,
                tipo_atencion_nombre: "Cita Original",
                duracion_minutos: 0,
              };
              horariosDisponibles.push(horarioOriginal);
              horariosDisponibles.sort((a, b) =>
                a.hora_inicio.localeCompare(b.hora_inicio)
              );
            }
          }
          setHorarios(horariosDisponibles);
        })
        .catch((e) => console.error("Error al cargar horarios:", e))
        .finally(() => setLoadingHorarios(false));
    } else {
      setHorarios([]);
    }
  }, [selectedMedico, fecha, isEditMode, initialCita]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Permite que SeccionReporteIA actualice el estado de este formulario
  const handleReporteChange = (newReporte) => {
    setForm((prev) => ({ ...prev, reporte: newReporte }));
  };

  const handleHorarioSelect = (horario) => {
    setForm((prev) => ({
      ...prev,
      hora_inicio: horario.hora_inicio,
      bloque_horario: horario.bloque_horario_id,
    }));
  };

  // El 'reporte' se envía al guardar
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      paciente: true,
      medico: true,
      fecha: true,
      hora_inicio: true,
    });
    if (!form.paciente || !selectedMedico || !fecha || !form.hora_inicio) {
      return;
    }
    const payload = {
      paciente: form.paciente.value,
      bloque_horario: form.bloque_horario,
      fecha: fecha,
      hora_inicio: form.hora_inicio,
      notas: form.notas,
      estado_cita: form.estado_cita,
      medico: selectedMedico.value,
      reporte: form.reporte, // ¡Se envía el reporte al guardar!
    };
    onSubmit(payload);
  };

  const invalid = {
    paciente: touched.paciente && !form.paciente,
    medico: touched.medico && !selectedMedico,
    hora_inicio: touched.hora_inicio && !form.hora_inicio,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label="Paciente *"
          error={invalid.paciente && "Seleccione un paciente"}
        >
          <Select
            options={pacientesOptions}
            value={form.paciente}
            onChange={(option) => setForm((f) => ({ ...f, paciente: option }))}
            onBlur={() => setTouched((t) => ({ ...t, paciente: true }))}
            placeholder="Seleccione o busque un paciente..."
            isLoading={loadingPacientes}
            isDisabled={loading || isEditMode}
            isSearchable
            classNamePrefix="react-select"
          />
        </Field>

        <Field
          label="Médico *"
          error={invalid.medico && "Seleccione un médico"}
        >
          {isUserMedico ? (
            <input
              type="text"
              value={selectedMedico?.label || "Cargando..."}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
            />
          ) : (
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadMedicos}
              value={selectedMedico}
              onChange={setSelectedMedico}
              onBlur={() => setTouched((t) => ({ ...t, medico: true }))}
              placeholder="Buscar médico..."
              isDisabled={loading || isEditMode}
              classNamePrefix="react-select"
            />
          )}
        </Field>
      </div>

      <Field label="Fecha de la Cita *">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          disabled={loading || !selectedMedico}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
      </Field>

      {selectedMedico && fecha && (
        <Field
          label="Horario Disponible *"
          error={invalid.hora_inicio && "Seleccione un horario"}
        >
          {loadingHorarios ? (
            <div className="text-center p-4 text-sm text-gray-500">
              Cargando horarios...
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {horarios.length > 0 ? (
                horarios.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleHorarioSelect(h)}
                    className={`px-3 py-2 border rounded-lg text-sm font-medium transition ${
                      form.hora_inicio === h.hora_inicio
                        ? "bg-blue-600 text-white border-blue-600 shadow"
                        : "bg-white hover:bg-gray-50 border-gray-300"
                    }`}
                  >
                    {h.hora_inicio.substring(0, 5)}
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                  No hay horarios disponibles para el médico en esta fecha.
                </div>
              )}
            </div>
          )}
        </Field>
      )}

      {isEditMode && (
        <Field label="Estado de la Cita">
          <select
            name="estado_cita"
            value={form.estado_cita}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
          >
            {ESTADOS_CITA_OPTIONS.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Notas del Paciente (al reservar)">
        <textarea
          name="notas"
          value={form.notas}
          readOnly // El campo ya no es editable
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Estilo de solo lectura
          placeholder="El paciente no dejó notas al reservar."
        />
      </Field>

      
      {/* Sección de IA insertada */}
      {/* Solo se muestra si estamos editando una cita existente */}
      {isEditMode && (
        <SeccionReporteIA 
          citaId={initialCita.id}
          initialReporte={form.reporte} // Pasa el reporte de la BD
          onReporteChange={handleReporteChange} // Pasa el callback
        />
      )}

      {/* Botones Principales del Formulario */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !form.paciente || !form.hora_inicio}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading
            ? "Guardando..."
            : isEditMode
            ? "Guardar Cambios"
            : "Agendar Cita"}
        </button>
      </div>
    </form>
  );
}