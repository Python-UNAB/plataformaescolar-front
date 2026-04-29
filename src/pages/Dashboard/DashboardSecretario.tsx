import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courseService } from "../../services/course.service";
import { userService } from "../../services/user.service";
import { Card, Loading } from "../../components";
import type { Course } from "../../types";
import { GraduationCap, Users, BookOpen, UserPlus, Search } from "lucide-react";

export function DashboardSecretario() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, studentsData] = await Promise.all([
          courseService.getCourses({ activo: true }),
          userService.getUsers({ role: "ALUMNO", limit: 1 }),
        ]);
        setCourses(coursesData);
        setStudentCount(studentsData.pagination.total);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const currentYear = new Date().getFullYear();
  const currentYearCourses = courses.filter((c) => c.anio === currentYear);

  return (
    <div className="dashboard">
      <h1>Bienvenido, {user?.nombre}</h1>
      <p className="dashboard-subtitle">Panel de Secretario</p>

      {isLoading ? (
        <Loading message="Cargando datos..." />
      ) : (
        <>
          <div className="stats-grid">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <GraduationCap size={32} />
                </div>
                <h3>Cursos Activos</h3>
                <div className="stat-value">{currentYearCourses.length}</div>
                <div className="stat-label">Año {currentYear}</div>
              </Card.Body>
            </Card>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <Users size={32} />
                </div>
                <h3>Alumnos Registrados</h3>
                <div className="stat-value">{studentCount}</div>
                <div className="stat-label">Total en el sistema</div>
              </Card.Body>
            </Card>
          </div>

          <div className="dashboard-section">
            <h2>Acciones Rápidas</h2>
            <div className="quick-actions">
              <Link to="/cursos" className="action-card">
                <div className="action-icon">
                  <GraduationCap size={24} />
                </div>
                <div className="action-content">
                  <h3>Gestionar Cursos</h3>
                  <p>Crear y administrar cursos</p>
                </div>
              </Link>
              <Link to="/materias" className="action-card">
                <div className="action-icon">
                  <BookOpen size={24} />
                </div>
                <div className="action-content">
                  <h3>Gestionar Materias</h3>
                  <p>Crear materias y asignar docentes</p>
                </div>
              </Link>
              <Link to="/inscripciones" className="action-card">
                <div className="action-icon">
                  <UserPlus size={24} />
                </div>
                <div className="action-content">
                  <h3>Inscripciones</h3>
                  <p>Inscribir alumnos a cursos</p>
                </div>
              </Link>
              <Link to="/alumnos" className="action-card">
                <div className="action-icon">
                  <Search size={24} />
                </div>
                <div className="action-content">
                  <h3>Buscar Alumnos</h3>
                  <p>Consultar historial académico</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
