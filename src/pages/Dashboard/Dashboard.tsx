import { useAuth } from "../../context/AuthContext";
import { DashboardDirectivo } from "./DashboardDirectivo";
import { DashboardSecretario } from "./DashboardSecretario";
import { DashboardPreceptor } from "./DashboardPreceptor";
import { DashboardDocente } from "./DashboardDocente";
import { DashboardAlumno } from "./DashboardAlumno";
import "./Dashboard.css";

export function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  switch (user.role) {
    case "DIRECTIVO":
      return <DashboardDirectivo />;
    case "SECRETARIO":
      return <DashboardSecretario />;
    case "PRECEPTOR":
      return <DashboardPreceptor />;
    case "DOCENTE":
      return <DashboardDocente />;
    case "ALUMNO":
      return <DashboardAlumno />;
    default:
      return (
        <div className="dashboard">
          <h1>Bienvenido, {user.nombre}</h1>
          <p>Rol no reconocido: {user.role}</p>
        </div>
      );
  }
}
