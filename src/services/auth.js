import apiClient from './apiClient';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hora en milisegundos

class AuthService {
  constructor() {
    this.currentUser = null;
    this.loadUserFromStorage();
    this.setupSessionTimeout();
  }

  loadUserFromStorage() {
    const userData = localStorage.getItem('userData');
    const sessionTime = localStorage.getItem('sessionTime');
    if (userData && sessionTime) {
      const now = Date.now();
      if (now - parseInt(sessionTime, 10) < SESSION_TIMEOUT) {
        this.currentUser = JSON.parse(userData);
      } else {
        this.clearUserFromStorage();
      }
    }
  }

  saveUserToStorage(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    localStorage.setItem('sessionTime', Date.now().toString());
    this.currentUser = userData;
  }

  clearUserFromStorage() {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionTime');
    this.currentUser = null;
  }

  async login(correo, password) {
    const response = await apiClient.login(correo, password);
    const userData = {
      usuario_id: response.usuario_id,
      token: response.token,
      rol: response.rol,
      grupo_id: response.grupo_id,
      grupo_nombre: response.grupo_nombre,
      puede_acceder: response.puede_acceder,
      correo: correo,
      reportes: response.reportes
    };
    this.saveUserToStorage(userData);
    return userData;
  }

  logout() {
    apiClient.logout();
    window.location.href = '/'; 
  }

  isAuthenticated() {
    return !!this.currentUser && !!localStorage.getItem('token');
  }

  isSuperAdmin() {
    return this.currentUser?.rol === 'superAdmin';
  }

  isAdmin() {
    return this.currentUser?.rol === 'administrador';
  }

  canViewReports() {
    if (this.isSuperAdmin()) return true;
    
    return this.currentUser?.reportes === true;
  }

  isMedico() {
    return this.currentUser?.rol === 'medico';
  }

  canAccessSystem() {
    const user = this.getCurrentUser();
    // El superAdmin siempre puede acceder
    if (user?.rol === 'superAdmin') return true;
    // Otros roles dependen de puede_acceder
    return user?.puede_acceder === true;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  canManageUsers() {
    return this.isSuperAdmin() || this.isAdmin();
  }

  canManageGroups() {
    return this.isSuperAdmin();
  }

  canViewReports() {
    return this.isSuperAdmin() || this.isAdmin();
  }

  canManageInventory() {
    return this.isSuperAdmin() || this.isAdmin();
  }

  // Expira sesión tras 1 hora
  setupSessionTimeout() {
    setInterval(() => {
      const sessionTime = localStorage.getItem('sessionTime');
      if (sessionTime) {
        const now = Date.now();
        if (now - parseInt(sessionTime, 10) >= SESSION_TIMEOUT) {
          this.logout();
        }
      }
    }, 60 * 1000); // Verifica cada minuto
  }
}

export default new AuthService();
