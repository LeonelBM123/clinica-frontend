import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";
import authService from '../services/auth';

// Los mismos iconos, pero aumentaremos ligeramente su tamaño para mejor visibilidad
import {
  Home,
  Users,
  FileText,
  Building,
  UserCircle,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  PieChart,
  Settings,
  Calendar,
  Pill,
  Box,
  CreditCard,
  Eye,
  CalendarRange,
  CalendarPlus2,
} from "lucide-react";

const getAllMenuPackages = () => {
  const baseMenu = [
    {
      name: "Dashboard",
      items: [{ label: "Panel Principal", path: "", icon: <Home size={20} /> }],
    },
  ];

  return [
    ...baseMenu,
    {
      name: "Gestión del Sistema",
      items: [
        {
          label: "Gestionar Grupos",
          path: "grupos",
          icon: <Building size={20} />,
        },
        {
          label: "Gestionar Usuarios",
          path: "usuarios",
          icon: <UserCircle size={20} />,
        },
        {
          label: "Gestionar Médicos",
          path: "medicos",
          icon: <Stethoscope size={20} />,
        },
        {
          label: "Gestionar Patologías",
          path: "patologias",
          icon: <HeartPulse size={20} />,
        },
        {
          label: "Ver Bitácora",
          path: "bitacora",
          icon: <ClipboardList size={20} />,
        },
      ],
    },
    {
      name: "Reportes y Configuración",
      items: [
        {
          label: "Configuración Global",
          path: "configuracion-global",
          icon: <Settings size={20} />,
        },
      ],
    },
  ];
};

const getMenuPackagesByRole = (currentUser) => {
  const rol = currentUser?.rol;

  const iconSize = 20;

  const baseMenu = [
    {
      name: "Dashboard",
      items: [
        { label: "Panel Principal", path: "", icon: <Home size={iconSize} /> },
      ],
    },
    {
      name: "Gestión de Pacientes",
      items: [
        {
          label: "Gestionar Pacientes",
          path: "pacientes",
          icon: <Users size={iconSize} />,
        },
      ],
    },
  ];

  if (rol === "superAdmin") {
    return getAllMenuPackages();
  } else if (rol === "administrador") {
    return [
      ...baseMenu,
      {
        name: "Gestión de Usuarios",
        items: [
          {
            label: "Gestionar Usuarios",
            path: "usuarios",
            icon: <UserCircle size={iconSize} />,
          },
          {
            label: "Gestionar Médicos",
            path: "medicos",
            icon: <Stethoscope size={iconSize} />,
          },
          {
            label: "Ver Bitácora",
            path: "bitacora",
            icon: <ClipboardList size={iconSize} />,
          },

        ],
      },
      {
        name: "Historias Clínicas y Diagnósticos",
        items: [
          {
            label: "Patologías",
            path: "patologias",
            icon: <HeartPulse size={iconSize} />,
          },
          {
            label: "Tratamientos y Medicación",
            path: "tratamientos",
            icon: <Pill size={iconSize} />,
          },
          {
            label: "Resultados de Exámenes",
            path: "resultados-examenes",
            icon: <FileText size={iconSize} />,
          },
        ],
      },
      {name: "Reportes",
        items: [
          {
            label: "Reportes de servicios",
            path: "reportes",
            icon: "🗿",
          },
        ],
      },
    ];
  } else if (rol === "medico") {
    return [
      ...baseMenu,
      {
        name: "Gestión de Citas",
        items: [
          {
            label: "Gestionar Citas",
            path: "citas-medicas",
            icon: <CalendarPlus2 size={iconSize} />,
          },
          {
            label: "Bloque Horario",
            path: "bloques-horarios",
            icon: <CalendarRange size={iconSize} />,
          },
        ],
      },
      {
        name: "Patologias , Tratamientos y Resultados",
        items: [
          {
            label: "patologias",
            path: "patologias",
            icon: <HeartPulse size={iconSize} />,
          },
          {
            label: "Tratamientos",
            path: "tratamientos",
            icon: <Pill size={iconSize} />,
          },
          {
            label: "Resultados de Exámenes",
            path: "resultados-examenes",
            icon: <FileText size={iconSize} />,
          },
          {
            label: "Gestionar Historias Medicas",
            path: "historias-clinicas",
            icon: <Stethoscope size={iconSize} />,
          },
        ],
      },

      {name: "Reportes",
        items: [
          {
            label: "Reportes de atencion",
            path: "reportes",
            icon: "",
          },
        ],
      },

    ];
  }

  return baseMenu;
};

export default function AdminLayout() {
  const currentUser = authService.getCurrentUser();
   console.log('currentUser:', currentUser);
  console.log('rol:', currentUser?.rol);
  const menuPackages = getMenuPackagesByRole(currentUser); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(open => !open);

  // Generar título dinámico basado en rol
  const getTitle = () => {
    if (currentUser?.rol === 'superAdmin') return 'Super Admin Panel';
    if (currentUser?.rol === 'administrador') return `Admin - ${currentUser?.grupo_nombre || 'Dashboard'}`;
    if (currentUser?.rol === 'medico') return `Médico - ${currentUser?.grupo_nombre || 'Dashboard'}`;
    return 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar
        menuPackages={menuPackages}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header 
          title={getTitle()} 
          toggleSidebar={toggleSidebar}
        />
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}