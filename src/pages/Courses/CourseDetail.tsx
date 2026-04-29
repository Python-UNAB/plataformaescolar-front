import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { courseService } from "../../services/course.service";
import { subjectService } from "../../services/subject.service";
import { userService } from "../../services/user.service";
import {
  Button,
  Alert,
  Card,
  Loading,
  EmptyState,
  PageHeader,
  Modal,
  ConfirmDialog,
} from "../../components";
import {
  GraduationCap,
  BookOpen,
  Users,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Save,
  X,
  ClipboardList,
} from "lucide-react";
import type { Course, Subject, CreateSubjectDto, User } from "../../types";

interface CourseDetail extends Course {
  materias: Array<
    Subject & { docente?: { id: string; nombre: string; apellido: string } }
  >;
  inscripciones: Array<{
    id: string;
    alumno: {
      id: string;
      nombre: string;
      apellido: string;
      dni: string;
      email: string;
    };
  }>;
}

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCourse = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = (await courseService.getCourseById(id)) as CourseDetail;
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar curso");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const handleCreateSubject = () => {
    setEditingSubject(null);
    setShowSubjectModal(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;

    setIsDeleting(true);
    try {
      await subjectService.deleteSubject(deletingSubject.id);
      setConfirmOpen(false);
      setDeletingSubject(null);
      loadCourse();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al desactivar materia");
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirm = (subject: Subject) => {
    setDeletingSubject(subject);
    setConfirmOpen(true);
  };

  if (isLoading) {
    return <Loading size="lg" message="Cargando curso..." />;
  }

  if (error || !course) {
    return (
      <div>
        <Alert variant="error">{error || "Curso no encontrado"}</Alert>
        <Button
          variant="secondary"
          onClick={() => navigate("/cursos")}
          className="mt-4"
          icon={ArrowLeft}
          iconPosition="left"
        >
          Volver a Cursos
        </Button>
      </div>
    );
  }

  const turnoLabels = { MANANA: "Mañana", TARDE: "Tarde", NOCHE: "Noche" };

  return (
    <div className="course-detail">
      <PageHeader
        title={`Curso ${course.nombre}`}
        icon={GraduationCap}
        subtitle={`Año ${course.anio} - Turno ${turnoLabels[course.turno]}`}
        breadcrumbs={[
          { label: "Cursos", href: "/cursos" },
          { label: course.nombre },
        ]}
      />

      <div className="grid grid-cols-2 mb-4">
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <div className="card-header-with-icon">
                <BookOpen size={20} />
                <h3>Materias ({course.materias.length})</h3>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={handleCreateSubject}
                icon={Plus}
                iconPosition="left"
              >
                Agregar Materia
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {course.materias.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                message="Sin materias"
                description="No hay materias registradas"
              />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Docente</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {course.materias.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.nombre}</td>
                      <td>
                        {subject.docente ? (
                          `${subject.docente.nombre} ${subject.docente.apellido}`
                        ) : (
                          <span className="text-muted">Sin asignar</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditSubject(subject)}
                            icon={Pencil}
                            iconPosition="left"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openDeleteConfirm(subject)}
                            icon={Trash2}
                            iconPosition="left"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <div className="card-header-with-icon">
                <Users size={20} />
                <h3>Alumnos Inscriptos ({course.inscripciones.length})</h3>
              </div>
              <Link to="/inscripciones">
                <Button
                  size="sm"
                  variant="primary"
                  icon={ClipboardList}
                  iconPosition="left"
                >
                  Gestionar Inscripciones
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            {course.inscripciones.length === 0 ? (
              <EmptyState
                icon={Users}
                message="Sin alumnos"
                description="No hay alumnos inscriptos"
              />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>DNI</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {course.inscripciones.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>
                        <Link to={`/alumnos/${enrollment.alumno.id}`}>
                          {enrollment.alumno.apellido},{" "}
                          {enrollment.alumno.nombre}
                        </Link>
                      </td>
                      <td>{enrollment.alumno.dni}</td>
                      <td>{enrollment.alumno.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card.Body>
        </Card>
      </div>

      {showSubjectModal && (
        <SubjectModal
          subject={editingSubject}
          cursoId={course.id}
          onClose={() => {
            setShowSubjectModal(false);
            setEditingSubject(null);
          }}
          onSave={() => {
            setShowSubjectModal(false);
            setEditingSubject(null);
            loadCourse();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeletingSubject(null);
        }}
        onConfirm={handleDeleteSubject}
        title="Desactivar Materia"
        message={`¿Está seguro de desactivar la materia ${deletingSubject?.nombre}?`}
        confirmLabel="Desactivar"
        variant="danger"
        isLoading={isDeleting}
        icon={Trash2}
      />
    </div>
  );
}

interface SubjectModalProps {
  subject: Subject | null;
  cursoId: string;
  onClose: () => void;
  onSave: () => void;
}

function SubjectModal({
  subject,
  cursoId,
  onClose,
  onSave,
}: SubjectModalProps) {
  const [formData, setFormData] = useState<CreateSubjectDto>({
    nombre: subject?.nombre || "",
    cursoId,
    docenteId: subject?.docenteId || "",
  });
  const [docentes, setDocentes] = useState<
    Pick<User, "id" | "nombre" | "apellido" | "email">[]
  >([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDocentes = async () => {
      try {
        const data = await userService.getDocentes();
        setDocentes(data);
      } catch (err) {
        console.error("Error loading docentes:", err);
      }
    };
    loadDocentes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (subject) {
        await subjectService.updateSubject(subject.id, {
          nombre: formData.nombre,
          docenteId: formData.docenteId || undefined,
        });
      } else {
        await subjectService.createSubject({
          ...formData,
          docenteId: formData.docenteId || undefined,
        });
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar materia");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={subject ? "Editar Materia" : "Nueva Materia"}
      icon={BookOpen}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        <div className="form-group">
          <label className="form-label">Nombre de la Materia</label>
          <input
            type="text"
            className="form-input"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            placeholder="Ej: Matemáticas, Lengua, Historia"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Docente a Cargo</label>
          <select
            className="form-select"
            value={formData.docenteId}
            onChange={(e) =>
              setFormData({ ...formData, docenteId: e.target.value })
            }
          >
            <option value="">Sin asignar</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {docente.apellido}, {docente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
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
    </Modal>
  );
}
