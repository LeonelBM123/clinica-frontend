import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Eye, X, LogOut } from 'lucide-react';
import authService from '../../services/auth';
import apiClient from '../../services/apiClient';

export default function Sidebar({ menuPackages, isSidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const [openPackages, setOpenPackages] = useState({});

  const togglePackage = (packageName) => {
    setOpenPackages(prev => ({
      ...prev,
      [packageName]: !prev[packageName],
    }));
  };

  const handleLinkClick = () => {
    if (isSidebarOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleLogout =async () => {
    await apiClient.logout();
    window.location.href='/';
  };

  const isActive = (path) => {
    const basePath = "/AdminLayout";
    if (path === "" || path === "/") {
      return location.pathname === basePath || location.pathname === `${basePath}/`;
    }
    return location.pathname.startsWith(`${basePath}/${path}`);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-[1000] flex w-64 flex-col bg-slate-900 text-gray-300 shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700 p-4">
          <div className="flex items-center">
            <Eye className="text-teal-400" size={28} />
            <h2 className="ml-3 text-2xl font-bold text-white">
              Visionex
            </h2>
          </div>
          <button
            className="md:hidden p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            onClick={toggleSidebar}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuPackages.map((pkg, index) => (
              <li key={index}>
                <div
                  className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                  onClick={() => togglePackage(pkg.name)}
                >
                  <span className="uppercase tracking-wider">{pkg.name}</span>
                  <ChevronDown
                    size={20}
                    className={`transform transition-transform duration-50 ${
                      openPackages[pkg.name] ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <ul className={`overflow-hidden transition-all duration-100 ease-in-out ${openPackages[pkg.name] ? 'max-h-[500px] mt-1' : 'max-h-0'}`}>
                   {pkg.items.map((item, itemIndex) => {
                      const active = isActive(item.path);
                      return (
                        <li key={itemIndex}>
                          <Link
                            to={item.path}
                            onClick={handleLinkClick}
                            className={`relative flex items-center rounded-lg py-2.5 pl-11 pr-3 text-sm transition-all duration-200 group ${
                              active
                                ? "bg-teal-600 text-white font-semibold shadow-md"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <div className={`absolute left-0 h-full w-1 rounded-r-full transition-all ${active ? 'bg-teal-300' : 'bg-transparent'}`}></div>
                            <span className={`transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'}`}>
                              {item.icon}
                            </span>
                            <span className="ml-4">{item.label}</span>
                          </Link>
                        </li>
                      );
                   })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        {/* Pie del Sidebar y botón de cerrar sesión */}
        <div className="border-t border-slate-700 p-4 flex flex-col gap-2 items-center">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-bold tracking-widest
              text-blue-100 bg-slate-800 rounded-lg shadow hover:bg-red-800 hover:text-white
              transition-all duration-150 border border-slate-700"
          >
            <LogOut className="w-5 h-5 mr-3 text-blue-300" />
            CERRAR SESIÓN
          </button>
          <p className="text-center text-xs text-slate-500 mt-2">
            © {new Date().getFullYear()} Visionex Admin
          </p>
        </div>
      </aside>
    </>
  );
}