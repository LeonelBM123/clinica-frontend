import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/apiClient';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;//"http://127.0.0.1:8000/api";

//confi de speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES'; 
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

export default function VoiceCommandButton() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  //constructor de los parametros
  const buildUrlWithParams = (urlPath, params) => {
    let url = `${API_BASE_URL}${urlPath}`;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }
    return url;
  };

  //descarga por voz
  const descargarPdfPorVoz = async (urlPath, fileName, params) => {
    setFeedback(`Generando ${fileName}...`);
    try {
      const token = localStorage.getItem("token");
      const url = buildUrlWithParams(urlPath, params);
      console.log(`[Voz DEBUG] Descargando archivo desde: ${url}`);
      
      const response = await axios.get(url, {
        headers: { Authorization: token ? `Token ${token}` : "" },
        responseType: "blob",
      });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove(); 
      URL.revokeObjectURL(fileURL);
      console.log("[Voz DEBUG] Descarga completada.");
      setFeedback(`❇️ Reporte de ${fileName} descargado.`);
    } catch (e) {
      console.error("[Voz ERROR] Descarga por voz fallida:", e);
      setError("Error al descargar el archivo solicitado.");
      setFeedback("");
    }
  };

  //navegar por voz pero con parametros
  const navegarPorVoz = (urlPath, params) => {
    let url = urlPath; 
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }
    console.log(`[Voz DEBUG] Navegando a: ${url}`);
    navigate(url); 
  };

  const handleVoiceCommand = () => {
    if (!SpeechRecognition) {
      setError("Tu navegador no soporta el reconocimiento de voz.");
      console.warn("[DEBUG] SpeechRecognition no está disponible.");
      return;
    }

    // Si ya está escuchando, detenerlo
    if (isListening) {
      console.log("[DEBUG] Deteniendo reconocimiento manualmente.");
      recognition.stop();
      setIsListening(false);
      setFeedback("");
      return;
    }

    console.log("[DEBUG] Iniciando reconocimiento de voz...");
    setIsListening(true);
    setError("");
    setFeedback("🎤 Escuchando... (ej: 'reporte de citas de ayer')");

    try {
      recognition.start();
    } catch (e) {
      setError("No se pudo iniciar el micrófono. ¿Ya está en uso?");
      setIsListening(false);
      setFeedback("");
      return;
    }

    recognition.onstart = () => {
      console.log("[DEBUG] Reconocimiento iniciado.");
    };

    recognition.onspeechstart = () => {
      console.log("[DEBUG] Detección de voz iniciada.");
      setFeedback("🎙️ Capturando tu voz...");
    };

    recognition.onspeechend = () => {
      console.log("[DEBUG] Detección de voz terminada.");
      setFeedback("Procesando...");
    };

    recognition.onend = () => {
      console.log("[DEBUG] Reconocimiento finalizado (onend).");
      setIsListening(false);
      
    };

    recognition.onresult = async (event) => {
      const textoComando = event.results[0][0].transcript;
      console.log(`[DEBUG] Texto reconocido: "${textoComando}"`);
      setFeedback(`Comando reconocido: "${textoComando}". Procesando...`);

      try {
        console.log("[DEBUG] Enviando texto al backend para procesar...");
        const nlpResponse = await api.post('/reportes/comando_voz/', {
          texto_comando: textoComando,
        });

        const accion = nlpResponse; 

        console.log("[DEBUG] Respuesta del backend:", accion);

        if (accion && accion.accion === 'descargar') {
          console.log(`[DEBUG] Acción: Descargar (${accion.fileName}) con params:`, accion.params);
          await descargarPdfPorVoz(accion.url, accion.fileName, accion.params);
        
        } else if (accion && accion.accion === 'navegar') {
          console.log(`[DEBUG] Acción: Navegar a ${accion.url} con params:`, accion.params);
          setFeedback(`Navegando a ${accion.reporte_id}...`);
          navegarPorVoz(accion.url, accion.params);
        
        } else {
          if (accion && accion.error) {
            console.warn(`[DEBUG] Error de NLP: ${accion.error}`);
            setError(accion.error);
            setFeedback("");
          } else {
            console.warn("[DEBUG] Acción desconocida o fallida:", accion);
            setError("No se reconoció una acción válida.");
            setFeedback("");
          }
        }

      } catch (e) {
        console.error("[ERROR] Fallo al procesar el comando:", e);
        if (e.message && (e.message.includes("Comando no reconocido") || e.message.includes("Servicio NLP"))) {
          setError(e.message);
        } else {
          setError("No se pudo procesar el comando. Revisa la consola.");
        }
        setFeedback("");
S     }
    };

    //manejo de errores de voz
    recognition.onerror = (event) => {
      console.error("[Voz ERROR] Reconocimiento de voz falló:", event.error);
      switch (event.error) {
        case "no-speech":
          setFeedback("No se detectó voz. Intenta de nuevo.");
          break;
        case "network":
          setError("Error de red: el servicio de voz no está disponible.");
          break;
        case "not-allowed":
      case "security":
          setError("Permiso de micrófono denegado. Actívalo en el navegador.");
          break;
        case "aborted":
          console.log("[DEBUG] Reconocimiento abortado.");
          setFeedback(""); // Limpiar feedback si se aborta
          break;
        default:
          setError(`Error de voz: ${event.error}`);
      }
      setIsListening(false);
    };
  };

  //si el nav no soporta el sr solo chrome
  if (!SpeechRecognition) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="text-yellow-600" size={20} />
        <span className="text-yellow-800 text-sm">
          El reconocimiento de voz no es compatible con este navegador.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleVoiceCommand}
        className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-colors font-semibold shadow-lg
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-300' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-300'
          }`}
      >
        {isListening ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <Mic size={22} />
        )}
        <span>{isListening ? 'Detener' : 'Comando de Voz'}</span>
      </button>

      <div className="h-4 mt-2 text-center">
        {feedback && !error && (
          <p className="text-sm text-gray-600">{feedback}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

