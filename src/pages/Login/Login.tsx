import { useState, FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Alert, Card } from "../../components";
import { GraduationCap, Mail, Lock, LogIn } from "lucide-react";
import "./Login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-container">
        <Card.Header className="login-header">
          <div className="login-logo">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>
          <h1>Plataforma Escolar</h1>
          <p>Ingrese sus credenciales para acceder</p>
        </Card.Header>

        <Card.Body>
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <Alert variant="error" onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                <span>Correo electrónico</span>
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-input form-input--with-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@escuela.edu.ar"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={16} />
                <span>Contraseña</span>
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  className="form-input form-input--with-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="login-btn"
              leftIcon={<LogIn size={18} />}
            >
              Ingresar
            </Button>
          </form>
        </Card.Body>

        <Card.Footer className="login-footer">
          <p className="text-muted">Sistema de Gestión Académica</p>
        </Card.Footer>
      </Card>
    </div>
  );
}
