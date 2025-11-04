import React from 'react'
import Prueba from './Prueba'

export default function EditarHistorasClinicas() {
    const [historia, setHistoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cambia este ID por uno real de tu base de datos
    const pacienteId = 1;

    useEffect(() => {
        const fetchHistoria = async () => {
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/api/pacientes/${pacienteId}/historia`
                );

                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }

                const data = await res.json();
                setHistoria(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoria();
    }, []);

    if (loading) return <p>Cargando historia clínica...</p>;
    if (error) return <p style={{ color: "red" }}>❌ {error}</p>;

    return (
        <div style={{ padding: 16 }}>
            <h1>Gestión de Historias Clínicas</h1>

            {historia && (
                <>
                    <h2>Paciente</h2>
                    <p><b>Nombre:</b> {historia.paciente.usuario.nombre}</p>
                    <p><b>Correo:</b> {historia.paciente.usuario.correo}</p>
                    <p><b>Historia Clínica:</b> {historia.paciente.numero_historia_clinica}</p>
                    <p><b>Edad:</b> {historia.paciente.usuario.edad} años</p>

                    <hr />
                    <h3>Patologías</h3>
                    {historia.patologias.length === 0 ? (
                        <p>No tiene patologías registradas.</p>
                    ) : (
                        <ul>
                            {historia.patologias.map((p) => (
                                <li key={p.id}>
                                    <b>{p.nombre}</b> — {p.gravedad}
                                    {p.tratamientos.length > 0 && (
                                        <ul>
                                            {p.tratamientos.map((t) => (
                                                <li key={t.id}>
                                                    Tratamiento: {t.nombre} ({t.duracion_dias || "sin duración"} días)
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <hr />
                    <h3>Resultados de Exámenes</h3>
                    {historia.resultados_examenes.length === 0 ? (
                        <p>No hay exámenes disponibles.</p>
                    ) : (
                        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Médico</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historia.resultados_examenes.map((ex) => (
                                    <tr key={ex.id}>
                                        <td>{ex.tipo_examen}</td>
                                        <td>{ex.medico?.usuario || "—"}</td>
                                        <td>{ex.estado}</td>
                                        <td>{new Date(ex.fecha_creacion).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
}
