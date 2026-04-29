import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/user.service";
import { Card, Loading } from "../../components";
import type { Role } from "../../types";
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCog,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";

interface RoleCount {
  role: Role;
  count: number;
  label: string;
  icon: React.ReactNode;
}

const roleIcons: Record<Role, React.ReactNode> = {
  DIRECTIVO: <UserCog size={32} />,
  SECRETARIO: <ClipboardList size={32} />,
  PRECEPTOR: <LayoutDashboard size={32} />,
  DOCENTE: <BookOpen size={32} />,
  ALUMNO: <GraduationCap size={32} />,
};

const quickActions = [
  {
    id: "manage-users",
    icon: <Users size={24} />,
    title: "Gestionar Usuarios",
    subtitle: "Alta, baja y modificación de usuarios del sistema",
    to: "/usuarios",
  },
  {
    id: "view-courses",
    icon: <GraduationCap size={24} />,
    title: "Ver Cursos",
    subtitle: "Consultar cursos y su información",
    to: "/cursos",
  },
];

export function DashboardDirectivo() {
  const { user } = useAuth();
  const [roleCounts, setRoleCounts] = useState<RoleCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const roles: { role: Role; label: string }[] = [
          { role: "DIRECTIVO", label: "Directivos" },
          { role: "SECRETARIO", label: "Secretarios" },
          { role: "PRECEPTOR", label: "Preceptores" },
          { role: "DOCENTE", label: "Docentes" },
          { role: "ALUMNO", label: "Alumnos" },
        ];

        const counts = await Promise.all(
          roles.map(async ({ role, label }) => {
            const result = await userService.getUsers({ role, limit: 1 });
            return {
              role,
              label,
              count: result.pagination.total,
              icon: roleIcons[role],
            };
          }),
        );

        setRoleCounts(counts);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="dashboard">
      <h1>Bienvenido, {user?.nombre}</h1>
      <p className="dashboard-subtitle">Panel de Directivo</p>

      <div className="dashboard-section">
        <h2>Estadísticas de Usuarios</h2>
        {isLoading ? (
          <Loading message="Cargando estadísticas..." />
        ) : (
          <div className="stats-grid">
            {roleCounts.map(({ role, label, count, icon }) => (
              <Card.Stat key={role} icon={icon} label={label} value={count} />
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Acciones Rápidas</h2>
        <div className="quick-actions">
          {quickActions.map((action) => (
            <Card.Action
              key={action.id}
              icon={action.icon}
              title={action.title}
              subtitle={action.subtitle}
              to={action.to}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
