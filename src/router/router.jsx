import { createBrowserRouter } from "react-router-dom";
import HomePage from "../home/HomePage";
import ResetPassword from "../pages/RecuperarPassword"
import Login from "../pages/Login.jsx";
import RegisterClinic from "../pages/RegisterClinic";
import React from "react";

// Layout principal
import AdminLayout from "../layouts/Layout.jsx";

// Componentes de protección
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

// Páginas principales
import AdminDashboard from "../pages/AdminDashboard.jsx";

// Páginas de gestión de patologías
import GestionarPatologias from "../pages/Gestionar_Patologias/index.jsx";
import CrearPatologia from "../pages/Gestionar_Patologias/create.jsx";
import EditarPatologia from "../pages/Gestionar_Patologias/edit.jsx";

// paginas de gestion tratamientos
import GestionarTratamientos from "../pages/Gestionar_Tratamientos/index.jsx";
import CrearTratamiento from "../pages/Gestionar_Tratamientos/create.jsx";
import EditarTratamiento from "../pages/Gestionar_Tratamientos/edit.jsx";

// Páginas de gestión de medicos
import GestionarMedicos from "../pages/Gestionar_Medicos/index.jsx";
import CrearMedico from "../pages/Gestionar_Medicos/create.jsx";
import EditarMedico from "../pages/Gestionar_Medicos/edit.jsx";

// Páginas de gestión de citas médicas
import GestionarCitasMedicas from "../pages/Gestionar_Cita_Medica/index.jsx";
import CrearCitaMedica from "../pages/Gestionar_Cita_Medica/create.jsx";
import EditarCitaMedica from "../pages/Gestionar_Cita_Medica/edit.jsx";

// Páginas de gestión de bloque horario
import GestionarBloqueHorario from "../pages/Bloque_Horario/index.jsx";
import CrearBloqueHorario from "../pages/Bloque_Horario/create.jsx";
import EditarBloqueHorario from "../pages/Bloque_Horario/edit.jsx";

// Páginas de gestión de pacientes
import GestionarPacientes from "../pages/Gestionar_Pacientes/index.jsx";
import CrearPaciente from "../pages/Gestionar_Pacientes/create.jsx";
import EditarPaciente from "../pages/Gestionar_Pacientes/edit.jsx";

// Páginas de gestión de usuarios
import GestionarUsuarios from "../pages/Gestionar_Usuarios/index.jsx";
import CrearUsuario from "../pages/Gestionar_Usuarios/create.jsx";
import EditarUsuario from "../pages/Gestionar_Usuarios/edit.jsx";

// Páginas de gestión de bitácora
import GestionarBitacora from "../pages/Gestionar_Bitacora/index";

// Paginas de Historial de Consultas
import HistorialConsultas from "../pages/HistorialConsultas/index.jsx";
import PacienteCitas from "../pages/HistorialConsultas/PacienteCitas.jsx";

// Páginas de gestión de resultados de exámenes
import GestionarResultadosExamenes from "../pages/Gestionar_Resultados_Examenes/index.jsx";
import CrearResultadoExamen from "../pages/Gestionar_Resultados_Examenes/create.jsx";
import EditarResultadoExamen from "../pages/Gestionar_Resultados_Examenes/edit.jsx";


//paginas de reportes
import PaginaReportes from "../pages/Reportes/reportesAdmin.jsx";
import FormPersonalizar from "../pages/Reportes/formPersonalizar.jsx";

//Paginas de gestion de Historias Clinicas
import GestionarHistoriasClinicas from "../pages/Gestionar_Historias_Clinicas/index.jsx";
import EditarHistorasClinicas from "../pages/Gestionar_Historias_Clinicas/edit.jsx";

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const router = createBrowserRouter([
  // Rutas públicas
  {
    path: "/",
    element: (
      <PublicRoute>
        <HomePage />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register-clinic",
    element: (
      <PublicRoute>
        <RegisterClinic />
      </PublicRoute>
    ),
  },
  {
    path: "recuperar-password",
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  // Layout principal - todas las rutas autenticadas usando AdminLayout

  // Layout principal - rutas autenticadas usando Layout
  {
    path: "/dashboard",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },

      // Gestión de Patologías (Admin y Doctor)
      {
        path: "patologias",
        element: <GestionarPatologias />,
        children: [
          { path: "nueva", element: <CrearPatologia /> },
          { path: ":id/editar", element: <EditarPatologia /> },
        ],
      },
      // Gestión de Tratamientos (Admin y Doctor)
      {
        path: "tratamientos",
        element: <GestionarTratamientos />,
        children: [
          { path: "nuevo", element: <CrearTratamiento /> },
          { path: ":id/editar", element: <EditarTratamiento /> },
        ],
      },

      // Gestión de Medicos (Admin)
      {
        path: "medicos",
        element: <GestionarMedicos />,
        children: [
          { path: "nuevo", element: <CrearMedico /> },
          { path: ":id/editar", element: <EditarMedico /> },
        ],
      },

      // Gestión de citas medicas (Doctor)
      {
        path: "citas-medicas",
        element: <GestionarCitasMedicas />,
        children: [
          { path: "nuevo", element: <CrearCitaMedica /> },
          { path: ":id/editar", element: <EditarCitaMedica /> },
        ],
      },

      // Gestión de Bloque Horario (Doctor)
      {
        path: "bloques-horarios",
        element: <GestionarBloqueHorario />,
        children: [
          { path: "nuevo", element: <CrearBloqueHorario /> },
          { path: ":id/editar", element: <EditarBloqueHorario /> },
        ],
      },

      // Gestión de Pacientes (Medicos)
      {
        path: "pacientes",
        element: <GestionarPacientes />,
        children: [
          { path: "nuevo", element: <CrearPaciente /> },
          { path: ":id/editar", element: <EditarPaciente /> },
        ],
      },

      // Gestión de Usuarios ()
      {
        path: "usuarios",
        element: <GestionarUsuarios />,
        children: [
          { path: "nuevo", element: <CrearUsuario /> },
          { path: ":id/editar", element: <EditarUsuario /> },
        ],
      },

      // Gestión de Resultados de Exámenes
      {
        path: "resultados-examenes",
        element: <GestionarResultadosExamenes />,
        children: [
          { path: "nuevo", element: <CrearResultadoExamen /> },
          { path: ":id/editar", element: <EditarResultadoExamen /> },
        ],
      },

      // Consultar Historial de Consultas (Doctor y/o Paciente)
      {
        path: "historial-clinico",
        element: <HistorialConsultas currentUser={currentUser} />,
      },

      // Ruta independiente para mostrar el historial de un paciente
      {
        path: "pacientes/:idPaciente/citas",
        element: <PacienteCitas />,
      },

      //rutas para los reportes
      {
        path: "reportes",
        element: <PaginaReportes />
      },
      {
        path: "reportes/personalizar/:tipoReporte",
        element: <FormPersonalizar />
      },

      //rutas para gestion de Historias Clinicas
      {
        path: "historias-clinicas",
        children: [
          { path: "", element: <GestionarHistoriasClinicas /> },       // /dashboard/historias-clinicas
          { path: ":id", element: <GestionarHistoriasClinicas /> },    // /dashboard/historias-clinicas/123
        ],
      },
    ],
  },
]);

export default router;
