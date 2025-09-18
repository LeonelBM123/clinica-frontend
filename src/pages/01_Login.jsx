import '../styles/Login.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8000/api/usuarios/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ correo, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                // Accedemos al arreglo de authorities y verificamos si contiene "Gerente"
                if (data.rol && data.rol.includes("Administrador")) {
                    navigate("/adminlayout");
                } else if (data.rol && data.rol.includes("Medico")) {
                    navigate("/workerlayout");
                } else {
                    navigate("/userlayout");
                }
            } else {
                const errorData = await response.json();
                setErrorMsg(errorData.error || "Credenciales inválidas");
            }
        } catch (error) {
            console.error("Error en login:", error);
            setErrorMsg("Error de conexión con el servidor");
        }
    };

    return (
        <div className="login-bg">
            <div className="glass-card">
                <div className="login-box-modern">
                    <h2>Login</h2>
                    <p className="subtitle">Inicia sesión para continuar</p>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input
                                type="text"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                                placeholder="Correo"
                                autoFocus
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Contraseña"
                            />
                        </div>
                        <button type="submit" className="modern-btn">
                            Ingresar
                        </button>
                    </form>
                    {errorMsg && <p className="error-modern">{errorMsg}</p>}
                    <p className="register-link-modern">
                        ¿No tienes cuenta?<br/> <a href="/register_user">Regístrate aquí</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;