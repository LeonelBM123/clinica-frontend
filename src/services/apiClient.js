import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // import.meta.env.VITE_API_URL;

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL
    });

    // Interceptor para agregar token automáticamente
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar respuestas de error
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          window.location.href = "/";
        }
        return Promise.reject(error);
      }
    );
  }

  async login(correo, password) {
    try {
      const response = await this.client.post("/cuentas/usuarios/login/", {
        correo,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Error de autenticación");
    }
  }

  // Métodos simples y directos
  async get(url) {
    try {
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || error.message || "Error en la petición"
      );
    }
  }

  // Auth endpoints

 async logout() {
  try {
    const response = await this.client.post('cuentas/usuarios/logout/',
      {},
      {
        headers:{
          Authorization: localStorage.getItem('token')
        }
    });
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || error.message || 'Error al cerrar sesión'
    );
  }
}



  async getToken2Reset(correo) {
    try {
      const response = await this.client.post('cuentas/usuarios/solicitar_reset_token/', { correo });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message || 'Error al solicitar token de reseteo');
    }
  }

  async resetPassword(correo, reset_token, new_password) {
    try {
      const response = await this.client.post('cuentas/usuarios/nueva_password/', { correo, reset_token, new_password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message || 'Error al restablecer contraseña');
    }
  }

  async register(userData) {
    try {
      const response = await this.client.post('cuentas/usuarios/', userData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        if (typeof errorData === 'object' && !errorData.detail) {
          const firstField = Object.keys(errorData)[0];
          const firstError = errorData[firstField];
          if (Array.isArray(firstError)) {
            throw new Error(`${firstField}: ${firstError[0]}`);
          }
          throw new Error(`${firstField}: ${firstError}`);
        }
        throw new Error(errorData.detail || errorData.message || 'Error en el registro');
      }
      throw new Error('Error de conexión');
    }
  }

  // Grupos endpoints
  async getGrupos() {
    try {
      const response = await this.client.get('cuentas/grupos/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message || 'Error al obtener grupos');
    }
  }
  async post(url, data) {
    try {
      let config = {};
      // Si es FormData, no enviar Content-Type para que axios lo ponga automáticamente
      if (data instanceof FormData) {
        config.headers = {};
      }
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        // Si hay errores de validación específicos
        if (typeof errorData === "object" && !errorData.detail) {
          const firstField = Object.keys(errorData)[0];
          const firstError = errorData[firstField];
          if (Array.isArray(firstError)) {
            throw new Error(`${firstField}: ${firstError[0]}`);
          }
          throw new Error(`${firstField}: ${firstError}`);
        }
        // Error general
        throw new Error(
          errorData.detail || errorData.message || "Error en la petición"
        );
      }
      throw new Error("Error de conexión");
    }
  }

  async put(url, data) {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        if (typeof errorData === "object" && !errorData.detail) {
          const firstField = Object.keys(errorData)[0];
          const firstError = errorData[firstField];
          if (Array.isArray(firstError)) {
            throw new Error(`${firstField}: ${firstError[0]}`);
          }
          throw new Error(`${firstField}: ${firstError}`);
        }
        throw new Error(
          errorData.detail || errorData.message || "Error en la petición"
        );
      }
      throw new Error("Error de conexión");
    }
  }

  async patch(url, data) {
    try {
      const response = await this.client.patch(url, data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        if (typeof errorData === "object" && !errorData.detail) {
          const firstField = Object.keys(errorData)[0];
          const firstError = errorData[firstField];
          if (Array.isArray(firstError)) {
            throw new Error(`${firstField}: ${firstError[0]}`);
          }
          throw new Error(`${firstField}: ${firstError}`);
        }
        throw new Error(
          errorData.detail || errorData.message || "Error en la petición"
        );
      }
      throw new Error("Error de conexión");
    }
  }

  async delete(url) {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || error.message || "Error al eliminar"
      );
    }
  }

  async createGrupo(data) {
    return this.post("/cuentas/grupos/", data);
  }
}

// Crear una instancia única
const apiClient = new ApiClient();

// Exportar tanto la instancia como la clase
export { apiClient as api };
export default apiClient;

