import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { userService } from "../../services/user.service";
import { enrollmentService } from "../../services/enrollment.service";
import type { StudentHistory } from "../../services/enrollment.service";
import type { User, Periodo } from "../../types";
import {
  PageHeader,
  Card,
  DataTable,
  Loading,
  EmptyState,
  Button,
  Alert,
  Badge,
  type Column,
} from "../../components";
import {
  Search,
  Users,
  FileText,
  User as UserIcon,
  ArrowLeft,
} from "lucide-react";
import "./Students.css";

type StudentRow = Pick<User, "id" | "nombre" | "apellido" | "dni" | "email">;

export function Students() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchStudents = async () => {
    if (searchTerm.length < 2) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await userService.getAlumnos(searchTerm);
      setStudents(data);
    } catch (err) {
      console.error("Error searching students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const columns: Column<StudentRow>[] = useMemo(
    () => [
      {
        field: "alumno",
        headerName: "Alumno",
        flex: 1,
        renderCell: (row) => `${row.apellido}, ${row.nombre}`,
      },
      {
        field: "dni",
        headerName: "DNI",
        width: 120,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1,
      },
      {
        field: "actions",
        headerName: "Acciones",
        width: 150,
        sortable: false,
        renderCell: (row) => (
          <Link to={`/alumnos/${row.id}`}>
            <Button
              size="sm"
              variant="primary"
              icon={FileText}
              iconPosition="left"
            >
              Ver Historial
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="students-page">
      <PageHeader title="Búsqueda de Alumnos" icon={Search} />

      <Card>
        <Card.Body>
          <div className="form-group">
            <label className="form-label">
              Buscar alumno por nombre, apellido o DNI
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ingrese al menos 2 caracteres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card.Body>
      </Card>

      <div className="mt-3">
        {isLoading ? (
          <Loading message="Buscando alumnos..." />
        ) : searchTerm.length < 2 ? (
          <Card>
            <Card.Body>
              <EmptyState
                icon={Search}
                message="Ingrese al menos 2 caracteres para buscar"
              />
            </Card.Body>
          </Card>
        ) : students.length === 0 ? (
          <Card>
            <Card.Body>
              <EmptyState icon={Users} message="No se encontraron alumnos" />
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Body>
              <DataTable
                data={students}
                columns={columns}
                pagination={false}
                emptyMessage="No se encontraron alumnos"
              />
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
}

export function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<StudentHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await enrollmentService.getStudentHistory(id);
        setHistory(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar historial",
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [id]);

  if (isLoading) {
    return <Loading fullPage message="Cargando historial académico..." />;
  }

  if (error || !history) {
    return (
      <div className="student-detail">
        <PageHeader
          title="Historial Académico"
          icon={UserIcon}
          breadcrumbs={[
            { label: "Alumnos", href: "/alumnos", icon: Users },
            { label: "Error" },
          ]}
        />
        <Alert variant="error">{error || "Alumno no encontrado"}</Alert>
        <div className="mt-3">
          <Link to="/alumnos">
            <Button variant="secondary" icon={ArrowLeft} iconPosition="left">
              Volver
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="student-detail">
      <PageHeader
        title="Historial Académico"
        icon={UserIcon}
        breadcrumbs={[
          { label: "Alumnos", href: "/alumnos", icon: Users },
          { label: `${history.alumno.nombre} ${history.alumno.apellido}` },
        ]}
      />

      <Card className="mb-4">
        <Card.Body>
          <div className="student-info-grid">
            <div>
              <strong>Nombre:</strong> {history.alumno.nombre}{" "}
              {history.alumno.apellido}
            </div>
            <div>
              <strong>DNI:</strong> {history.alumno.dni}
            </div>
            <div>
              <strong>Email:</strong> {history.alumno.email}
            </div>
          </div>
        </Card.Body>
      </Card>

      {history.historial.length === 0 ? (
        <Card>
          <Card.Body>
            <EmptyState
              icon={FileText}
              message="El alumno no tiene historial académico registrado"
            />
          </Card.Body>
        </Card>
      ) : (
        history.historial.map((enrollment) => (
          <Card key={enrollment.id} className="mb-3">
            <Card.Header>
              <h3>
                {enrollment.curso.nombre} - Año {enrollment.anio}
                {!enrollment.activo && (
                  <Badge variant="warning" className="ml-2">
                    Inactivo
                  </Badge>
                )}
              </h3>
            </Card.Header>
            <Card.Body>
              {enrollment.curso.materias.length === 0 ? (
                <p className="text-muted">No hay materias registradas</p>
              ) : (
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
                      </tr>
                    </thead>
                    <tbody>
                      {enrollment.curso.materias.map((materia) => {
                        const getGrade = (periodo: string) => {
                          const grade = materia.calificaciones.find(
                            (c) => c.periodo === periodo,
                          );
                          return grade?.nota;
                        };

                        return (
                          <tr key={materia.id}>
                            <td>{materia.nombre}</td>
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
}

function GradeCell({ nota }: { nota?: number }) {
  if (nota === undefined) {
    return <span className="text-muted">-</span>;
  }

  const isAprobado = nota >= 6;
  return (
    <span className={`grade-badge ${isAprobado ? "aprobado" : "desaprobado"}`}>
      {nota.toFixed(1)}
    </span>
  );
}
