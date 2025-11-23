import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, MapPin, Phone, Mail, Building,CheckCircle } from 'lucide-react';
import apiClient from '../services/apiClient';

function RegisterClinic() {
    const [searchParams] = useSearchParams(); 
    const planIdFromUrl = searchParams.get('plan');
    const [planNombre, setPlanNombre] = useState("");
    const [loadingPlan, setLoadingPlan] = useState(false);
    
    useEffect(() => {
        if (planIdFromUrl) {
            setLoadingPlan(true);
            setFormData(prev => ({ ...prev, plan_id: planIdFromUrl }));
            const API_BASE_URL = import.meta.env.VITE_API_URL;//"http://localhost:8000/api";
        
            fetch(`${API_BASE_URL}/suscripciones/planes/${planIdFromUrl}/`)
                .then(res => {
                    if (!res.ok) throw new Error("No se encontró el plan");
                    return res.json();
                })
                .then(data => {
                    setPlanNombre(data.nombre); 
                })
                .catch(err => {
                    console.error("Error cargando plan:", err);
                    setPlanNombre("Desconocido");
                })
                .finally(() => setLoadingPlan(false));
        }
    }, [planIdFromUrl]);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        direccion: "",
        telefono: "",
        correo: "",
        admin_nombre: "",
        admin_correo: "",
        admin_sexo: "",
        admin_fecha_nacimiento: "",
        admin_telefono: "",
        admin_direccion: "",
        admin_password: "",
        admin_confirm_password: "",
        plan:planIdFromUrl||""
    });
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setErrorMsg("");
    };

    const validateForm = () => {
        // Validaciones del grupo
        if (!formData.nombre.trim()) {
            setErrorMsg("El nombre de la clínica es obligatorio");
            return false;
        }
        if (formData.nombre.length < 3) {
            setErrorMsg("El nombre de la clínica debe tener al menos 3 caracteres");
            return false;
        }
        if (formData.telefono && formData.telefono.length < 8) {
            setErrorMsg("El teléfono debe tener exactamente 8 dígitos");
            return false;
        }
        if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
            setErrorMsg("El correo de la clínica no es válido");
            return false;
        }

        // Validaciones del administrador
        if (!formData.admin_nombre.trim()) {
            setErrorMsg("El nombre del administrador es obligatorio");
            return false;
        }
        if (!formData.admin_correo.trim()) {
            setErrorMsg("El correo del administrador es obligatorio");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.admin_correo)) {
            setErrorMsg("El correo del administrador no es válido");
            return false;
        }
        if (!formData.admin_sexo) {
            setErrorMsg("Debe seleccionar el sexo del administrador");
            return false;
        }
        if (!formData.admin_fecha_nacimiento) {
            setErrorMsg("La fecha de nacimiento del administrador es obligatoria");
            return false;
        }
        if (formData.admin_telefono && formData.admin_telefono.length < 8) {
            setErrorMsg("El teléfono del administrador debe tener exactamente 8 dígitos");
            return false;
        }
        if (!formData.admin_password || formData.admin_password.length < 6) {
            setErrorMsg("La contraseña del administrador debe tener al menos 6 caracteres");
            return false;
        }
        if (formData.admin_password !== formData.admin_confirm_password) {
            setErrorMsg("Las contraseñas del administrador no coinciden");
            return false;
        }

        // Validar que los correos no sean iguales
        if (formData.correo && formData.admin_correo && formData.correo === formData.admin_correo) {
            setErrorMsg("El correo de la clínica y del administrador deben ser diferentes");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setErrorMsg("");

        try {
            // Enviar todos los datos, incluyendo los del admin
            const grupoData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion || null,
                direccion: formData.direccion || null,
                telefono: formData.telefono || null,
                correo: formData.correo || null,
                admin_nombre: formData.admin_nombre,
                admin_correo: formData.admin_correo,
                admin_sexo: formData.admin_sexo,
                admin_fecha_nacimiento: formData.admin_fecha_nacimiento,
                admin_telefono: formData.admin_telefono,
                admin_direccion: formData.admin_direccion,
                admin_password: formData.admin_password,
                plan_id:formData.plan
            };

            await apiClient.createGrupo(grupoData);

            setSuccessMsg(
                `¡Clínica "${formData.nombre}" registrada exitosamente! ` +
                `Se ha creado un usuario administrador con correo: ${formData.admin_correo}.`
            );

            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setErrorMsg(error.message || "Error al registrar la clínica");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Eye className="w-12 h-12 text-green-600 mr-3" />
                            <h2 className="text-3xl font-bold text-gray-800">Registrar Nueva Clínica</h2>
                        </div>

                        <div className="mt-4 inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Plan seleccionado:  "{planNombre}". Se activará al registrar.
                        </div>
                        <p className="text-gray-600 mt-2">
                            Complete los datos de su clínica y del administrador principal
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 text-gray-950">
                        {/* Sección de datos de la clínica */}
                        <div className="bg-green-50 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                                <Building className="w-5 h-5 mr-2" />
                                Información de la Clínica
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de la Clínica *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Clínica Oftalmológica San José"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Descripción de servicios y especialidades..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        maxLength="8"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="12345678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Correo de la Clínica
                                    </label>
                                    <input
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="info@clinica.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Dirección
                                    </label>
                                    <textarea
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Dirección completa de la clínica"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección de datos del administrador */}
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">
                                👤 Datos del Administrador Principal
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="admin_nombre"
                                        value={formData.admin_nombre}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Dr. Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        name="admin_correo"
                                        value={formData.admin_correo}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="admin@clinica.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sexo *
                                    </label>
                                    <select
                                        name="admin_sexo"
                                        value={formData.admin_sexo}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Nacimiento *
                                    </label>
                                    <input
                                        type="date"
                                        name="admin_fecha_nacimiento"
                                        value={formData.admin_fecha_nacimiento}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="admin_telefono"
                                        value={formData.admin_telefono}
                                        onChange={handleChange}
                                        maxLength="8"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="12345678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dirección del Administrador
                                    </label>
                                    <input
                                        type="text"
                                        name="admin_direccion"
                                        value={formData.admin_direccion}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Dirección personal"
                                    />
                                </div>

                                {/* Campo de contraseña y confirmación en el formulario del administrador */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña del Administrador *
                                    </label>
                                    <input
                                        type="password"
                                        name="admin_password"
                                        value={formData.admin_password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        name="admin_confirm_password"
                                        value={formData.admin_confirm_password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mensajes de error y éxito */}
                        {errorMsg && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-600 text-sm">{errorMsg}</p>
                            </div>
                        )}

                        {successMsg && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-600 text-sm">{successMsg}</p>
                            </div>
                        )}

                        {/* Botón de submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 px-6 rounded-lg text-lg transition duration-200 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registrando Clínica...
                                </>
                            ) : (
                                "Registrar Clínica"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm mb-4">
                            ¿Ya tienes una cuenta?{" "}
                            <Link to="/login" className="text-green-600 hover:text-green-800 underline">
                                Iniciar sesión
                            </Link>
                        </p>
                        <Link
                            to="/"
                            className="inline-block text-green-600 hover:text-green-800 text-sm underline"
                        >
                            ← Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterClinic;