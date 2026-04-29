import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { gradeService } from "../../services/grade.service";
import {
  Button,
  Alert,
  Card,
  Loading,
  EmptyState,
  PageHeader,
  Breadcrumbs,
  Modal,
  ConfirmDialog,
} from "../../components";
import { Book, ClipboardEdit, Save, X, Trash2, Users } from "lucide-react";
import type {
  TeacherSubject,
  SubjectStudentData,
} from "../../services/grade.service";
import type { Periodo, CreateGradeDto } from "../../types";
import "./TeacherSubjects.css";

const periodos: Periodo[] = [
  "PRIMER_TRIMESTRE",
  "SEGUNDO_TRIMESTRE",
  "TERCER_TRIMESTRE",
  "FINAL",
];
const periodoLabels: Record<Periodo, string> = {
  PRIMER_TRIMESTRE: "1er Trimestre",
  SEGUNDO_TRIMESTRE: "2do Trimestre",
  TERCER_TRIMESTRE: "3er Trimestre",
  FINAL: "Final",
};

export function TeacherSubjects() {
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await gradeService.getTeacherSubjects();
        setSubjects(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar materias",
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadSubjects();
  }, []);

  if (isLoading) {
    return <Loading size="lg" text="Cargando materias..." />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div className="teacher-subjects">
      <PageHeader title="Mis Materias" icon={Book} />

      {subjects.length === 0 ? (
        <Card>
          <Card.Body>
            <EmptyState
              icon={Book}
              title="Sin materias asignadas"
              description="No tiene materias asignadas actualmente"
            />
          </Card.Body>
        </Card>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/mis-materias/${subject.id}`}
              className="subject-card"
            >
              <Card>
                <Card.Body>
                  <div className="subject-card-header">
                    <Book size={24} className="subject-icon" />
                    <h3>{subject.nombre}</h3>
                  </div>
                  <p className="course-name">
                    {subject.curso?.nombre} - Año {subject.curso?.anio}
                  </p>
                  <p className="turno">Turno: {subject.curso?.turno}</p>
                </Card.Body>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeacherSubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SubjectStudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    nombre: string;
    apellido: string;
  } | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [editingGrade, setEditingGrade] = useState<{
    id: string;
    nota: number;
    observaciones: string | null;
  } | null>(null);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const result = await gradeService.getSubjectStudents(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddGrade = (
    student: { id: string; nombre: string; apellido: string },
    periodo: Periodo,
  ) => {
    setSelectedStudent(student);
    setSelectedPeriodo(periodo);
    setEditingGrade(null);
    setShowGradeModal(true);
  };

  const handleEditGrade = (
    student: { id: string; nombre: string; apellido: string },
    periodo: Periodo,
    grade: { id: string; nota: number; observaciones: string | null },
  ) => {
    setSelectedStudent(student);
    setSelectedPeriodo(periodo);
    setEditingGrade(grade);
    setShowGradeModal(true);
  };

  if (isLoading) {
    return <Loading size="lg" text="Cargando datos..." />;
  }

  if (error || !data) {
    return (
      <div>
        <Alert variant="error">{error || "Materia no encontrada"}</Alert>
        <Button
          variant="secondary"
          onClick={() => navigate("/mis-materias")}
          className="mt-4"
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="subject-detail">
      <PageHeader
        title={data.materia.nombre}
        icon={Book}
        subtitle={`${data.curso.nombre} - Año ${data.curso.anio}`}
      >
        <Breadcrumbs
          items={[
            { label: "Mis Materias", href: "/mis-materias", icon: Book },
            { label: data.materia.nombre },
          ]}
        />
      </PageHeader>

      <Card>
        <Card.Header>
          <div className="card-header-with-icon">
            <Users size={20} />
            <h3>Calificaciones</h3>
          </div>
        </Card.Header>
        <Card.Body>
          {data.alumnos.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin alumnos"
              description="No hay alumnos inscriptos en este curso"
            />
          ) : (
            <div className="table-container">
              <table className="table grades-table">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>DNI</th>
                    {periodos.map((periodo) => (
                      <th key={periodo}>{periodoLabels[periodo]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.alumnos.map((alumno) => (
                    <tr key={alumno.id}>
                      <td>
                        <strong>
                          {alumno.apellido}, {alumno.nombre}
                        </strong>
                      </td>
                      <td>{alumno.dni}</td>
                      {periodos.map((periodo) => {
                        const grade = alumno.calificaciones[periodo];
                        return (
                          <td key={periodo} className="grade-cell">
                            {grade ? (
                              <button
                                className={`grade-button ${grade.nota >= 6 ? "aprobado" : "desaprobado"}`}
                                onClick={() =>
                                  handleEditGrade(alumno, periodo, grade)
                                }
                                title="Click para editar"
                              >
                                {grade.nota.toFixed(1)}
                              </button>
                            ) : (
                              <button
                                className="grade-button empty"
                                onClick={() => handleAddGrade(alumno, periodo)}
                                title="Click para agregar nota"
                              >
                                +
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {showGradeModal && selectedStudent && selectedPeriodo && id && (
        <GradeModal
          materiaId={id}
          alumno={selectedStudent}
          periodo={selectedPeriodo}
          existingGrade={editingGrade}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedStudent(null);
            setSelectedPeriodo(null);
            setEditingGrade(null);
          }}
          onSave={() => {
            setShowGradeModal(false);
            setSelectedStudent(null);
            setSelectedPeriodo(null);
            setEditingGrade(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

interface GradeModalProps {
  materiaId: string;
  alumno: { id: string; nombre: string; apellido: string };
  periodo: Periodo;
  existingGrade: {
    id: string;
    nota: number;
    observaciones: string | null;
  } | null;
  onClose: () => void;
  onSave: () => void;
}

function GradeModal({
  materiaId,
  alumno,
  periodo,
  existingGrade,
  onClose,
  onSave,
}: GradeModalProps) {
  const [nota, setNota] = useState(existingGrade?.nota?.toString() || "");
  const [observaciones, setObservaciones] = useState(
    existingGrade?.observaciones || "",
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      setError("La nota debe ser un número entre 0 y 10");
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingGrade) {
        await gradeService.updateGrade(existingGrade.id, {
          nota: notaNum,
          observaciones: observaciones || undefined,
        });
      } else {
        await gradeService.createGrade({
          alumnoId: alumno.id,
          materiaId,
          nota: notaNum,
          periodo,
          observaciones: observaciones || undefined,
        });
      }
      onSave();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar calificación",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingGrade) return;

    setIsSubmitting(true);
    try {
      await gradeService.deleteGrade(existingGrade.id);
      setConfirmOpen(false);
      onSave();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar calificación",
      );
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={existingGrade ? "Editar Calificación" : "Nueva Calificación"}
      icon={ClipboardEdit}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        <div className="grade-info">
          <p>
            <strong>Alumno:</strong> {alumno.apellido}, {alumno.nombre}
          </p>
          <p>
            <strong>Período:</strong> {periodoLabels[periodo]}
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Nota (0-10)</label>
          <input
            type="number"
            className="form-input"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            min="0"
            max="10"
            step="0.1"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Observaciones (opcional)</label>
          <textarea
            className="form-textarea"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            placeholder="Observaciones sobre el desempeño del alumno..."
          />
        </div>

        <div className="modal-actions">
          {existingGrade && (
            <Button
              type="button"
              variant="danger"
              onClick={() => setConfirmOpen(true)}
              isLoading={isSubmitting}
              className="mr-auto"
              icon={Trash2}
              iconPosition="left"
            >
              Eliminar
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            icon={X}
            iconPosition="left"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={Save}
            iconPosition="left"
          >
            Guardar
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Calificación"
        message={`¿Está seguro de eliminar esta calificación de ${alumno.apellido}, ${alumno.nombre}?`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isSubmitting}
        icon={Trash2}
      />
    </Modal>
  );
}
