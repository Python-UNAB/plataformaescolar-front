import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Search,
  Book,
  Award,
  LogOut,
  User,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Footer } from "../Footer";
import type { Role } from "../../types";
import Button from "../Button";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  roles: Role[];
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    path: "/dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
    roles: ["DIRECTIVO", "SECRETARIO", "PRECEPTOR", "DOCENTE", "ALUMNO"],
  },
  { path: "/usuarios", label: "Usuarios", icon: Users, roles: ["DIRECTIVO"] },
  {
    path: "/cursos",
    label: "Cursos",
    icon: GraduationCap,
    roles: ["DIRECTIVO", "SECRETARIO", "PRECEPTOR"],
  },
  {
    path: "/materias",
    label: "Materias",
    icon: BookOpen,
    roles: ["DIRECTIVO", "SECRETARIO"],
  },
  {
    path: "/inscripciones",
    label: "Inscripciones",
    icon: ClipboardList,
    roles: ["DIRECTIVO", "SECRETARIO"],
  },
  {
    path: "/alumnos",
    label: "Buscar Alumnos",
    icon: Search,
    roles: ["DIRECTIVO", "SECRETARIO", "PRECEPTOR"],
  },
  {
    path: "/mis-materias",
    label: "Mis Materias",
    icon: Book,
    roles: ["DOCENTE"],
  },
  {
    path: "/mis-calificaciones",
    label: "Mis Calificaciones",
    icon: Award,
    roles: ["ALUMNO"],
  },
];

const roleLabels: Record<Role, string> = {
  DIRECTIVO: "Directivo",
  SECRETARIO: "Secretario",
  PRECEPTOR: "Preceptor",
  DOCENTE: "Docente",
  ALUMNO: "Alumno",
};

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <div className="layout">
      <header className="header">
        <div className="header-brand">
          <GraduationCap className="header-brand__icon" size={32} />
          <h1 className="title__home">ClassMent</h1>
        </div>
        <div className="header-user">
          <div className="user-info">
            <User className="user-info__icon" size={18} />
            <span className="user-info__name">
              {user?.nombre} {user?.apellido}
            </span>
            <span className="user-role">{user && roleLabels[user.role]}</span>
          </div>
          <Button text="Cerrar sesión" icon={LogOut} onClick={handleLogout} />
        </div>
      </header>

      <div className="layout-body">
        <nav className="sidebar">
          <ul className="nav-list">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon className="nav-link__icon" size={20} />
                    <span className="nav-link__label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="main-content">{children}</main>
      </div>

      <Footer
        copyright={`© ${new Date().getFullYear()} Plataforma Escolar. Todos los derechos reservados.`}
      />
    </div>
  );
}
