import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { gradeService } from "../../services/grade.service";
import { Card, Loading, Badge, EmptyState } from "../../components";
import type { TeacherSubject } from "../../services/grade.service";
import { Book, BookOpen, ChevronRight } from "lucide-react";

export function DashboardDocente() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await gradeService.getTeacherSubjects();
        setSubjects(data);
      } catch (error) {
        console.error("Error loading subjects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="dashboard">
      <h1>Bienvenido, {user?.nombre}</h1>
      <p className="dashboard-subtitle">Panel de Docente</p>

      {isLoading ? (
        <Loading message="Cargando materias..." />
      ) : (
        <>
          <div className="stats-grid">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <Book size={32} />
                </div>
                <h3>Materias a Cargo</h3>
                <div className="stat-value">{subjects.length}</div>
              </Card.Body>
            </Card>
          </div>

          <div className="dashboard-section">
            <h2>Mis Materias</h2>
            {subjects.length === 0 ? (
              <Card>
                <Card.Body>
                  <EmptyState message="No tiene materias asignadas actualmente" />
                </Card.Body>
              </Card>
            ) : (
              <div className="subject-list">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    to={`/mis-materias/${subject.id}`}
                    className="subject-item"
                  >
                    <div className="subject-item-left">
                      <div className="subject-icon">
                        <BookOpen size={20} />
                      </div>
                      <div className="subject-info">
                        <h4>{subject.nombre}</h4>
                        <p>
                          {subject.curso?.nombre} - Año {subject.curso?.anio} -{" "}
                          {subject.curso?.turno}
                        </p>
                      </div>
                    </div>
                    <Badge variant="primary">
                      <span>Ver calificaciones</span>
                      <ChevronRight size={14} />
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
