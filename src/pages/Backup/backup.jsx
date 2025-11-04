import { useState } from "react";

export default function BackupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const formatLaPazTimestamp = () => {
    const tz = "America/La_Paz";
    const now = new Date();
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .format(now)
      .replace(":", "-");
    return `${date}_${time}`;
  };

  const backupToDrive = async () => {
    setLoading(true);
    setMessage("");
    try {
      const base = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
      const defaultUrl = "https://clinica-backend-b8m9.onrender.com/api";
      const url = `${defaultUrl}/reportes/backup/json-zip`;
      const token = (import.meta.env.VITE_BACKUP_TOKEN || "TU_TOKEN_LARGO").trim();

      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backup falló: ${text || res.status}`);
      }

      const blob = await res.blob();
      const filename = `backup_${formatLaPazTimestamp()}.zip`;
      const link = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
      link.href = urlBlob;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(urlBlob);

      setMessage("Backup generado y descargado correctamente.");
    } catch (err) {
      setMessage(err?.message || "Error realizando el backup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
      <h1 className="text-xl font-semibold mb-2">Backup a Google Drive</h1>
      <p className="text-sm text-slate-600 mb-6">
        Genera un backup en formato ZIP del sistema. El archivo se descargará
        con fecha y hora de La Paz.
      </p>
      <button
        onClick={backupToDrive}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-white ${
          loading ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Procesando..." : "Ejecutar backup"}
      </button>
      {message && (
        <div className="mt-4 text-sm text-slate-700">{message}</div>
      )}
    </div>
  );
}
