    import { useNavigate } from "react-router-dom";
    import { Eye, Calendar, UserPlus, FileText, BarChart2 } from 'lucide-react';

    const HomePage = () => {
        const navigate = useNavigate();

        const features = [
            {
                icon: <Calendar className="w-8 h-8 text-blue-600" />,
                title: "Agenda Inteligente",
                description: "Gestiona citas, horarios de médicos y disponibilidad de consultorios con un calendario intuitivo."
            },
            {
                icon: <FileText className="w-8 h-8 text-blue-600" />,
                title: "Historia Clínica Digital",
                description: "Accede al historial completo de tus pacientes, incluyendo exámenes, diagnósticos y tratamientos."
            },
            {
                icon: <BarChart2 className="w-8 h-8 text-blue-600" />,
                title: "Reportes y Analítica",
                description: "Obtén estadísticas clave sobre el rendimiento de tu clínica para tomar decisiones informadas."
            },
            {
                icon: <UserPlus className="w-8 h-8 text-blue-600" />,
                title: "Gestión de Pacientes",
                description: "Registra y administra la información de tus pacientes de forma segura y centralizada."
            }
        ];

        return (
            <div className="min-h-screen bg-gray-50 text-gray-800">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-2">
                                <Eye className="w-8 h-8 text-blue-600" />
                                <span className="text-2xl font-bold text-gray-800">Visionex</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    onClick={() => navigate('/register-clinic')}
                                    className="hidden sm:inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                >
                                    Registrar Clínica
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main>
                    {/* Hero Section */}
                    <section className="relative text-center py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                                La plataforma todo-en-uno para tu <span className="text-blue-600">clínica oftalmológica</span>
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                                Gestiona pacientes, citas, historias clínicas y facturación desde un solo lugar. Optimiza tu tiempo y mejora la atención.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => navigate('/register-clinic')}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Comienza Ahora
                                </button>

                                <button
                                    onClick={() => navigate('/choice_plan')}
                                    className="w-full sm:w-auto bg-white hover:bg-blue-200 text-black font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Ver planes
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section id="features" className="py-20 md:py-24 bg-white">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Potencia la gestión de tu clínica</h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    Visionex te ofrece todas las herramientas que necesitas para operar de manera eficiente y profesional.
                                </p>
                            </div>
                            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {features.map((feature) => (
                                    <div key={feature.title} className="p-6 bg-gray-50 rounded-xl border border-gray-200/80">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                                        <p className="mt-2 text-base text-gray-600">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="bg-gray-100">
                        <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                                ¿Listo para transformar tu clínica?
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                Únete a las clínicas que ya están optimizando su gestión con Visionex.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={() => navigate('/register-clinic')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Registrar mi Clínica Gratis
                                </button>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t">
                    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Visionex. Todos los derechos reservados.</p>
                    </div>
                </footer>
            </div>
        );
    };

    export default HomePage;