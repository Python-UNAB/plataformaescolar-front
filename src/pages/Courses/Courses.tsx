import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Plus,
  Eye,
  Pencil,
  XCircle,
  Users,
  BookOpen,
} from "lucide-react";
import { courseService } from "../../services/course.service";
import type { Course, CreateCourseDto, Turno } from "../../types";
import {
  Button,
  Card,
  Modal,
  ConfirmDialog,
  PageHeader,
  Loading,
  EmptyState,
  Alert,
  Badge,
} from "../../components";
import "./Courses.css";

const turnoLabels: Record<Turno, string> = {
  MANANA: "Mañana",
  TARDE: "Tarde",
  NOCHE: "Noche",
};

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getCourses({ anio: yearFilter });
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cursos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [yearFilter]);

  const handleCreate = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;

    setIsDeleting(true);
    try {
      await courseService.deleteCourse(deletingCourse.id);
      setConfirmOpen(false);
      setDeletingCourse(null);
      loadCourses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al desactivar curso");
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirm = (course: Course) => {
    setDeletingCourse(course);
    setConfirmOpen(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingCourse(null);
    loadCourses();
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="courses-page">
      <PageHeader
        title="Gestión de Cursos"
        icon={GraduationCap}
        actions={
          <Button icon={Plus} onClick={handleCreate}>
            Nuevo Curso
          </Button>
        }
      />

      <Card>
        <Card.Body>
          <div className="filter-group">
            <label className="form-label">Año lectivo:</label>
            <select
              className="form-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="error" className="mt-3" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      <div className="mt-3">
        {isLoading ? (
          <Loading message="Cargando cursos..." />
        ) : courses.length === 0 ? (
          <Card>
            <EmptyState
              icon={GraduationCap}
              message={`No hay cursos para el año ${yearFilter}`}
              description="Crea un nuevo curso para comenzar."
              action={
                <Button icon={Plus} onClick={handleCreate}>
                  Crear Curso
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <Card key={course.id} className="course-card">
                <Card.Body>
                  <div className="course-header">
                    <h3>{course.nombre}</h3>
                    <Badge variant={course.activo ? "success" : "danger"}>
                      {course.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="course-info">
                    <strong>Año:</strong> {course.anio}
                  </p>
                  <p className="course-info">
                    <strong>Turno:</strong> {turnoLabels[course.turno]}
                  </p>
                  <div className="course-stats">
                    <div className="stat">
                      <Users size={16} className="stat-icon" />
                      <span className="stat-value">
                        {course._count?.inscripciones || 0}
                      </span>
                      <span className="stat-label">Alumnos</span>
                    </div>
                    <div className="stat">
                      <BookOpen size={16} className="stat-icon" />
                      <span className="stat-value">
                        {course._count?.materias || 0}
                      </span>
                      <span className="stat-label">Materias</span>
                    </div>
                  </div>
                  <div className="course-actions">
                    <Link to={`/cursos/${course.id}`}>
                      <Button variant="primary" size="sm" icon={Eye}>
                        Ver detalles
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Pencil}
                      onClick={() => handleEdit(course)}
                    >
                      Editar
                    </Button>
                    {course.activo && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => openDeleteConfirm(course)}
                      >
                        Desactivar
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CourseModal
        course={editingCourse}
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeletingCourse(null);
        }}
        onConfirm={handleDelete}
        title="Desactivar Curso"
        message={`¿Está seguro de desactivar el curso ${deletingCourse?.nombre}?`}
        confirmLabel="Desactivar"
        variant="danger"
        isLoading={isDeleting}
        icon={XCircle}
      />
    </div>
  );
}

interface CourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

function CourseModal({ course, isOpen, onClose, onSave }: CourseModalProps) {
  const [formData, setFormData] = useState<
    CreateCourseDto & { activo?: boolean }
  >({
    nombre: "",
    anio: new Date().getFullYear(),
    turno: "MANANA",
    activo: true,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: course?.nombre || "",
        anio: course?.anio || new Date().getFullYear(),
        turno: course?.turno || "MANANA",
        activo: course?.activo ?? true,
      });
      setError("");
    }
  }, [isOpen, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (course) {
        await courseService.updateCourse(course.id, formData);
      } else {
        await courseService.createCourse(formData);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form="course-form" isLoading={isSubmitting}>
        Guardar
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? "Editar Curso" : "Nuevo Curso"}
      icon={GraduationCap}
      footer={modalFooter}
    >
      <form id="course-form" onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        <div className="form-group">
          <label className="form-label">Nombre del Curso</label>
          <input
            type="text"
            className="form-input"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            placeholder="Ej: 1°A, 2°B, 3°C"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Año Lectivo</label>
          <select
            className="form-select"
            value={formData.anio}
            onChange={(e) =>
              setFormData({ ...formData, anio: parseInt(e.target.value) })
            }
            required
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Turno</label>
          <select
            className="form-select"
            value={formData.turno}
            onChange={(e) =>
              setFormData({ ...formData, turno: e.target.value as Turno })
            }
            required
          >
            {Object.entries(turnoLabels).map(([turno, label]) => (
              <option key={turno} value={turno}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {course && (
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
              />{" "}
              Curso activo
            </label>
          </div>
        )}
      </form>
    </Modal>
  );
}
