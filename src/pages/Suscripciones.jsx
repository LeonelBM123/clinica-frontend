import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import Loader from "../components/Loader.jsx"


const Suscripciones = () => {
    const navigate = useNavigate();
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const API_BASE_URL = import.meta.env.VITE_API_URL;//"http://localhost:8000/api";
        
        fetch(`${API_BASE_URL}/suscripciones/planes/`)
         .then((res) => res.json())
            .then((data) => {
                
                if (Array.isArray(data)) {
                    setPlanes(data);
                } else if (data.results) {
                    setPlanes(data.results);
                } else {
                    setPlanes([]); 
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('No se pudieron cargar los planes disponibles.');
                setLoading(false);
            });
    }, []);

    const handleSelectPlan = (planId) => {
        navigate(`/register-clinic?plan=${planId}`);
    };

    if (loading) {
        <Loader/>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver al Inicio
                    </button>
                    <span className="text-xl font-bold text-blue-400">Planes y Precios</span>
                </div>
            </header>

            <main className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-blue-900  mb-4">
                        Elige el plan perfecto para tu clínica
                    </h1>
                    <p className="text-xl text-gray-600">
                        Escala tus operaciones con nuestros planes flexibles. Sin contratos forzosos.
                    </p>
                </div>

                {error ? (
                    <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg max-w-md mx-auto border border-red-200">
                        {error}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {planes.map((plan) => (
                            <div 
                                key={plan.id} 
                                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden flex flex-col
                                    ${plan.nombre === 'Enterprise' ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'}
                                `}
                            >
                                {plan.nombre === 'Enterprise' && (
                                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        RECOMENDADO
                                    </div>
                                )}

                                <div className="p-8 flex-grow">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.nombre}</h3>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-4xl font-extrabold text-gray-900">${parseFloat(plan.precio_mensual)}</span>
                                        <span className="text-gray-500 ml-2">/mes</span>
                                    </div>
                                    <p className="text-gray-600 mb-8 min-h-[50px]">{plan.descripcion || "Perfecto para empezar."}</p>

                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-center">
                                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className="text-gray-700">
                                                Hasta <strong>{plan.limite_usuarios} usuarios</strong>
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className="text-gray-700">
                                                {plan.limite_almacenamiento_gb} GB de almacenamiento
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            {plan.reportes ? (
                                                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            ) : (
                                                <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                                            )}
                                            <span className={plan.reportes ? "text-gray-700" : "text-gray-400 line-through"}>
                                                Reportes Financieros Avanzados
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            {plan.soporte_prioritario ? (
                                                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            ) : (
                                                <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                                            )}
                                            <span className={plan.soporte_prioritario ? "text-gray-700" : "text-gray-400 line-through"}>
                                                Soporte Prioritario 24/7
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-8 bg-gray-50 border-t border-gray-100 mt-auto">
                                    <button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200
                                            ${plan.nombre === 'Profesional' 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                                                : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}
                                        `}
                                    >
                                        Elegir {plan.nombre}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Suscripciones;