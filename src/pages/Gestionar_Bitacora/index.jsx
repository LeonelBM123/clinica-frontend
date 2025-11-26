// src/pages/Gestionar_Bitacora/index.jsx
import React, { useEffect, useState } from "react";
import UniversalTable from "../../components/UniversalTable";
import { api } from "../../services/apiClient";

export default function GestionarBitacora() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextUrl, setNextUrl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null); // para ver "extra" en modal
  const [showModal, setShowModal] = useState(false);

  // Helper: normalizar la respuesta del wrapper api (axios o fetch)
  const extractData = (res) => {
    // Si api.get devuelve directamente data o devuelve response con data
    if (!res) return res;
    if (Array.isArray(res)) return { results: res };
    if (res.data !== undefined) return res.data;
    return res;
  };

  const fetchPage = async (url = "/cuentas/bitacoras/") => {
    try {
      setError("");
      // Distinguimos el loading inicial del cargar más
      if (!nextUrl) setLoading(true); // primera carga
      const res = await api.get(url);
      const payload = extractData(res);

      // payload should hold { results, next, previous } when using DRF CursorPagination
      const results = Array.isArray(payload.results) ? payload.results : [];
      // si el wrapper devuelve directamente el array (raro), mejor fallback
      const newNext = payload.next ?? null;

      // append: si ya teníamos registros y venimos de next -> append
      setRegistros((prev) => {
        // si es la primera carga y prev está vacío -> reemplaza
        if (!prev || prev.length === 0 || url.endsWith("/cuentas/bitacoras/") || url === "/cuentas/bitacoras/") {
          return results;
        }
        // Evitar duplicados por si el backend envía solapamiento: filtrar por id
        const ids = new Set(prev.map((r) => r.id));
        const appended = results.filter((r) => !ids.has(r.id));
        return [...prev, ...appended];
      });

      setNextUrl(newNext);
    } catch (err) {
      console.error("Error fetching bitacoras:", err);
      // extraer mensaje de error de axios/fetch
      const msg = err?.response?.data || err?.message || String(err);
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // carga inicial
    fetchPage("/cuentas/bitacoras/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      // nextUrl puede ser absoluta (http://127...) o relativa (/api/...)
      // Queremos un path que funcione con nuestro "api" client.
      let urlToFetch = nextUrl;

      try {
        // Si es URL absoluta, extraemos pathname+search
        const parsed = new URL(nextUrl);
        urlToFetch = parsed.pathname + parsed.search; // e.g. "/api/cuentas/bitacoras/?cursor=..."
      } catch (e) {
        // Si no es absoluta, la usamos tal cual
        urlToFetch = nextUrl;
      }

      // Evitar doble prefijo "/api" si nuestro api client ya lo agrega.
      // Muchas apps configuran api base url como "/api", por eso si path empieza con "/api/"
      // y en el resto del código usamos "/cuentas/...", removemos el "/api" inicial.
      if (urlToFetch.startsWith("/api/")) {
        // quitar solo la primera ocurrencia de /api
        urlToFetch = urlToFetch.replace(/^\/api/, "");
      }

      await fetchPage(urlToFetch);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handler para "Ver detalle" usando el botón Editar del UniversalTable
  const handleViewDetail = async (item) => {
    // item viene sin "extra" en la lista; hay que pedir detalle
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/cuentas/bitacoras/${item.id}/`);
      const payload = extractData(res);
      setSelectedRecord(payload);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching detail:", err);
      const msg = err?.response?.data || err?.message || String(err);
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // Para mantener compatibilidad visual, reutilizamos los mismos columns
  const columns = [
    { header: "ID", accessor: "id" },
    {
      header: "Fecha/Hora",
      accessor: "timestamp",
      render: (item) =>
        item.timestamp
          ? new Date(item.timestamp).toLocaleString("es-BO", { timeZone: "America/La_Paz" })
          : "—"
    },
    { header: "Usuario", accessor: "usuario" },
    { header: "Acción", accessor: "accion" },
    { header: "Objeto", accessor: "objeto" },
    { header: "IP", accessor: "ip" },
    {
      header: "Extra",
      accessor: "extra",
      render: (item) => (item.extra ? JSON.stringify(item.extra) : "—")
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bitácora del Sistema</h1>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <UniversalTable
        title="Registros de Bitácora"
        data={registros}
        columns={columns}
        loading={loading}
        emptyMessage="No hay registros en la bitácora"
        showAddButton={false}
        showEditButton={true}     // usamos editar como "ver detalle"
        showDeleteButton={false}
        onEdit={(item) => handleViewDetail(item)}
        onDelete={() => {}}
      />

      {/* Cargar más */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleLoadMore}
          disabled={!nextUrl || loadingMore}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            !nextUrl ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loadingMore ? "Cargando..." : nextUrl ? "Cargar más" : "No hay más registros"}
        </button>
      </div>

      {/* Modal simple para mostrar 'extra' */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalle registro #{selectedRecord.id}</h2>
              <button
                onClick={() => { setShowModal(false); setSelectedRecord(null); }}
                className="text-gray-500 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-800">
              <div><strong>Fecha/Hora:</strong> {selectedRecord.timestamp}</div>
              <div><strong>Usuario:</strong> {selectedRecord.usuario}</div>
              <div><strong>Acción:</strong> {selectedRecord.accion}</div>
              <div><strong>Objeto:</strong> {selectedRecord.objeto}</div>
              <div><strong>IP:</strong> {selectedRecord.ip}</div>
              <div>
                <strong>Extra:</strong>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto" style={{ maxHeight: 300 }}>
                  {selectedRecord.extra ? JSON.stringify(selectedRecord.extra, null, 2) : "—"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}