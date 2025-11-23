import React from 'react';
import RoleGuard from '../components/RoleGuard';
import authService from '../services/auth';
import BIDashboard from './BIDashboard';

const AdminDashboard = () => {
  const currentUser = authService.getCurrentUser();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* --- HEADER PRINCIPAL --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Panel de Control
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            Bienvenido de vuelta, <span className="font-semibold text-indigo-600">{currentUser?.grupo_nombre || 'Usuario'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
             {currentUser?.rol || 'Invitado'}
           </span>
        </div>
      </div>

      {/* --- SECCIÓN DE BUSINESS INTELLIGENCE (SOLO ADMIN) --- */}
      {/* Esta sección tiene un diseño distintivo para resaltar los datos */}
      <RoleGuard requireAdmin>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
           <BIDashboard />
        </div>
      </RoleGuard>
      
      {/* --- SECCIÓN OPERATIVA (GRID DE TARJETAS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Mi Información (Visible para todos) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              Mi Perfil
            </h3>
            <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 flex items-center gap-2">
              <span className="font-medium text-gray-900">Correo:</span> 
              <span className="truncate">{currentUser?.correo}</span>
            </p>
            {currentUser?.grupo_nombre && (
              <p className="text-gray-600 flex items-center gap-2">
                <span className="font-medium text-gray-900">Clínica:</span> 
                {currentUser.grupo_nombre}
              </p>
            )}
          </div>
        </div>

        {/* 2. Gestión de Pacientes (Visible para todos) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Pacientes</h3>
            <svg className="w-6 h-6 text-blue-200 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            Gestión de historias clínicas, triajes y registro de nuevos pacientes.
          </p>
        </div>

        {/* 3. Configuración Administrativa (Solo Admin) */}
        <RoleGuard requireAdmin>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">Configuración</h3>
              <svg className="w-6 h-6 text-green-200 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Gestión de usuarios, roles, permisos y parámetros del sistema.
            </p>
          </div>
        </RoleGuard>

        {/* 4. Panel Médico (Solo Médico) */}
        <RoleGuard allowedRoles={['medico']}>
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 hover:shadow-md transition-all duration-200 cursor-pointer">
            <h3 className="text-lg font-bold text-amber-800 mb-2">Consultorio Médico</h3>
            <p className="text-sm text-amber-700">
              Acceso directo a agenda médica, recetas y diagnósticos.
            </p>
          </div>
        </RoleGuard>

      </div>

      {/* --- SECCIÓN SUPERADMIN (PANEL COMPLETO) --- */}
      <RoleGuard requireSuperAdmin>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Administración Global del SaaS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all">
              <h4 className="font-bold text-purple-900 mb-2">Gestión de Grupos (Clínicas)</h4>
              <p className="text-sm text-purple-700 mb-4">Alta y baja de suscripciones, configuración de inquilinos y dominios.</p>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-800 underline">Administrar Clínicas &rarr;</button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all">
              <h4 className="font-bold text-purple-900 mb-2">Reportes Globales</h4>
              <p className="text-sm text-purple-700 mb-4">Métricas agregadas de todas las clínicas registradas en el sistema.</p>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-800 underline">Ver Reportes &rarr;</button>
            </div>
          </div>
        </div>
      </RoleGuard>

    </div>
  );
};

export default AdminDashboard;