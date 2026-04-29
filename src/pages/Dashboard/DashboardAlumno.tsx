import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { gradeService } from "../../services/grade.service";
import { Card, Loading, Alert, EmptyState } from "../../components";
import type { StudentInfo } from "../../services/grade.service";
import type { Periodo } from "../../types";
import { GraduationCap, Calendar, BookOpen, AlertCircle } from "lucide-react";

export function DashboardAlumno() {
  const { user } = useAuth();
  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await gradeService.getStudentInfo();
        setInfo(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar información",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard">
        <Loading message="Cargando información..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (!info?.inscripcion) {
    return (
      <div className="dashboard">
        <h1>Bienvenido, {user?.nombre}</h1>
        <p className="dashboard-subtitle">Panel de Alumno</p>
        <Alert variant="warning" icon={AlertCircle}>
          {info?.mensaje || "No tienes inscripción activa para el año actual"}
        </Alert>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Bienvenido, {user?.nombre}</h1>
      <p className="dashboard-subtitle">Panel de Alumno</p>

      <div className="stats-grid">
        <Card className="stat-card">
          <Card.Body>
            <div className="stat-icon">
              <GraduationCap size={32} />
            </div>
            <h3>Curso</h3>
            <div className="stat-value">{info.inscripcion.curso.nombre}</div>
            <div className="stat-label">
              Turno {info.inscripcion.curso.turno}
            </div>
          </Card.Body>
        </Card>
        <Card className="stat-card">
          <Card.Body>
            <div className="stat-icon">
              <Calendar size={32} />
            </div>
            <h3>Año Lectivo</h3>
            <div className="stat-value">{info.inscripcion.anio}</div>
          </Card.Body>
        </Card>
        <Card className="stat-card">
          <Card.Body>
            <div className="stat-icon">
              <BookOpen size={32} />
            </div>
            <h3>Materias</h3>
            <div className="stat-value">{info.materias?.length || 0}</div>
          </Card.Body>
        </Card>
      </div>

      <div className="dashboard-section">
        <h2>Mis Calificaciones</h2>
        {!info.materias || info.materias.length === 0 ? (
          <Card>
            <Card.Body>
              <EmptyState message="No hay materias registradas para tu curso" />
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Body>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Docente</th>
                      <th>1er Trim</th>
                      <th>2do Trim</th>
                      <th>3er Trim</th>
                      <th>Final</th>
                      <th>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.materias.map((materia) => {
                      const getGrade = (periodo: Periodo) => {
                        const grade = materia.calificaciones.find(
                          (c) => c.periodo === periodo,
                        );
                        return grade?.nota;
                      };

                      return (
                        <tr key={materia.id}>
                          <td>
                            <strong>{materia.nombre}</strong>
                          </td>
                          <td>
                            {materia.docente
                              ? `${materia.docente.nombre} ${materia.docente.apellido}`
                              : "-"}
                          </td>
                          <td>
                            <GradeCell nota={getGrade("PRIMER_TRIMESTRE")} />
                          </td>
                          <td>
                            <GradeCell nota={getGrade("SEGUNDO_TRIMESTRE")} />
                          </td>
                          <td>
                            <GradeCell nota={getGrade("TERCER_TRIMESTRE")} />
                          </td>
                          <td>
                            <GradeCell nota={getGrade("FINAL")} />
                          </td>
                          <td>
                            <GradeCell
                              nota={materia.promedio ?? undefined}
                              isPromedio
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
}

function GradeCell({
  nota,
  isPromedio,
}: {
  nota?: number;
  isPromedio?: boolean;
}) {
  if (nota === undefined) {
    return <span className="text-muted">-</span>;
  }

  const isAprobado = nota >= 6;
  return (
    <span
      className={`grade-value ${isAprobado ? "aprobado" : "desaprobado"}`}
      style={{
        fontSize: isPromedio ? "1rem" : "0.875rem",
        fontWeight: isPromedio ? 700 : 500,
      }}
    >
      {nota.toFixed(1)}
    </span>
  );
}
