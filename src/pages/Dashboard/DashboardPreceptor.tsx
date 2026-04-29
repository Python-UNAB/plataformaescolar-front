import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courseService } from "../../services/course.service";
import { Card, Loading, Badge, EmptyState } from "../../components";
import type { Course } from "../../types";
import { GraduationCap, Users, BookOpen, Search, Calendar } from "lucide-react";

export function DashboardPreceptor() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await courseService.getCourses({ activo: true });
        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const currentYear = new Date().getFullYear();
  const currentYearCourses = courses.filter((c) => c.anio === currentYear);
  const totalStudents = currentYearCourses.reduce(
    (acc, c) => acc + (c._count?.inscripciones || 0),
    0,
  );

  return (
    <div className="dashboard">
      <h1>Bienvenido, {user?.nombre}</h1>
      <p className="dashboard-subtitle">Panel de Preceptor</p>

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
                <h3>Cursos</h3>
                <div className="stat-value">{currentYearCourses.length}</div>
                <div className="stat-label">Año {currentYear}</div>
              </Card.Body>
            </Card>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <Users size={32} />
                </div>
                <h3>Alumnos Inscriptos</h3>
                <div className="stat-value">{totalStudents}</div>
                <div className="stat-label">En cursos activos</div>
              </Card.Body>
            </Card>
          </div>

          <div className="dashboard-section">
            <h2>Acciones Rápidas</h2>
            <div className="quick-actions">
              <Link to="/cursos" className="action-card">
                <div className="action-icon">
                  <BookOpen size={24} />
                </div>
                <div className="action-content">
                  <h3>Ver Cursos</h3>
                  <p>Consultar cursos y alumnos</p>
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

          <div className="dashboard-section">
            <h2>Cursos del Año {currentYear}</h2>
            {currentYearCourses.length === 0 ? (
              <Card>
                <Card.Body>
                  <EmptyState message="No hay cursos activos para este año" />
                </Card.Body>
              </Card>
            ) : (
              <div className="subject-list">
                {currentYearCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/cursos/${course.id}`}
                    className="subject-item"
                  >
                    <div className="subject-item-left">
                      <div className="subject-icon">
                        <Calendar size={20} />
                      </div>
                      <div className="subject-info">
                        <h4>{course.nombre}</h4>
                        <p>Turno: {course.turno}</p>
                      </div>
                    </div>
                    <Badge variant="primary">
                      {course._count?.inscripciones || 0} alumnos
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
