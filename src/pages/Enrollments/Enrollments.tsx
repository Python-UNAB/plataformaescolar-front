import { useState, useEffect, useCallback } from "react";
import { enrollmentService } from "../../services/enrollment.service";
import { courseService } from "../../services/course.service";
import { userService } from "../../services/user.service";
import type { Enrollment, Course, User } from "../../types";
import {
  Button,
  Card,
  Modal,
  ConfirmDialog,
  PageHeader,
  Alert,
  type Column,
  type ChipConfig,
  type FilterConfig,
} from "../../components";
import { ClipboardList, UserPlus, Trash2 } from "lucide-react";
import "./Enrollments.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Configuration
   ───────────────────────────────────────────────────────────────────────────── */

const statusChipConfig: ChipConfig = {
  labels: { true: "Activo", false: "Inactivo" },
  variants: { true: "success", false: "danger" },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Enrollments Page Component
   ───────────────────────────────────────────────────────────────────────────── */

export function Enrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    cursoId: "",
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingEnrollment, setDeletingEnrollment] =
    useState<Enrollment | null>(null);

  // Form state for enrollment (complex form with search)
  const [selectedAlumno, setSelectedAlumno] = useState<Pick<
    User,
    "id" | "nombre" | "apellido" | "dni"
  > | null>(null);
  const [selectedCursoId, setSelectedCursoId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    Pick<User, "id" | "nombre" | "apellido" | "dni" | "email">[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const currentYear = new Date().getFullYear();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [enrollmentsData, coursesData] = await Promise.all([
        enrollmentService.getEnrollments({
          anio: currentYear,
          cursoId: filters.cursoId || undefined,
        }),
        courseService.getCourses({ anio: currentYear, activo: true }),
      ]);
      setEnrollments(enrollmentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, filters.cursoId]);

  useEffect(() => {
    loadData();
  }, [filters.cursoId]);

  // Search alumnos with debounce
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await userService.getAlumnos(searchTerm);
        setSearchResults(data);
      } catch (err) {
        console.error("Error searching alumnos:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilter = (values: Record<string, string>) => {
    setFilters(values);
  };

  const handleCreate = () => {
    setSelectedAlumno(null);
    setSelectedCursoId("");
    setSearchTerm("");
    setSearchResults([]);
    setModalError("");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingEnrollment) return;

    setIsSubmitting(true);
    try {
      await enrollmentService.deleteEnrollment(deletingEnrollment.id);
      setConfirmOpen(false);
      setDeletingEnrollment(null);
      loadData();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error al eliminar inscripción",
      );
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (enrollment: Enrollment) => {
    setDeletingEnrollment(enrollment);
    setConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumno || !selectedCursoId) return;

    setIsSubmitting(true);
    setModalError("");
    try {
      await enrollmentService.createEnrollment({
        alumnoId: selectedAlumno.id,
        cursoId: selectedCursoId,
        anio: currentYear,
      });
      handleModalClose();
      loadData();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Error al crear inscripción",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter configuration (dynamic with courses)
  const filterConfig: FilterConfig[] = [
    {
      name: "cursoId",
      type: "select",
      options: [
        { value: "", label: "Todos los cursos" },
        ...courses.map((c) => ({
          value: c.id,
          label: `${c.nombre} - ${c.turno}`,
        })),
      ],
    },
  ];

  // Table columns configuration
  const columns: Column<Enrollment>[] = [
    {
      field: "alumno",
      headerName: "Alumno",
      flex: 1,
      renderCell: (row) => `${row.alumno?.apellido}, ${row.alumno?.nombre}`,
    },
    {
      field: "dni",
      headerName: "DNI",
      width: 120,
      renderCell: (row) => row.alumno?.dni,
    },
    {
      field: "curso",
      headerName: "Curso",
      flex: 1,
      renderCell: (row) => row.curso?.nombre,
    },
    {
      field: "activo",
      headerName: "Estado",
      width: 110,
      type: "chip",
      chipConfig: statusChipConfig,
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      sortable: false,
      renderCell: (row) =>
        row.activo ? (
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => openDeleteConfirm(row)}
            title="Eliminar"
          />
        ) : null,
    },
  ];

  const modalFooter = (
    <>
      <Button
        variant="secondary"
        onClick={handleModalClose}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="enrollment-form"
        isLoading={isSubmitting}
        disabled={!selectedAlumno || !selectedCursoId}
      >
        Inscribir
      </Button>
    </>
  );

  return (
    <div className="enrollments-page">
      <PageHeader
        title={`Inscripciones ${currentYear}`}
        icon={ClipboardList}
        actions={
          <Button onClick={handleCreate} icon={UserPlus}>
            Nueva Inscripción
          </Button>
        }
      />

      <Card.Filters
        filters={filterConfig}
        onSubmit={handleFilter}
        searchLabel="Filtrar"
      />

      {error && (
        <Alert variant="error" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card.Data
        className="mt-3"
        data={enrollments}
        columns={columns}
        rowIdField="id"
        isLoading={isLoading}
        emptyIcon={ClipboardList}
        emptyMessage="No hay inscripciones registradas"
        emptyDescription="Crea una nueva inscripción para comenzar."
        emptyAction={
          <Button onClick={handleCreate} icon={UserPlus}>
            Nueva Inscripción
          </Button>
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title="Nueva Inscripción"
        icon={ClipboardList}
        footer={modalFooter}
      >
        <form id="enrollment-form" onSubmit={handleSubmit}>
          {modalError && (
            <Alert variant="error" onDismiss={() => setModalError("")}>
              {modalError}
            </Alert>
          )}

          <div className="form-group">
            <label className="form-label">Buscar Alumno</label>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!!selectedAlumno}
            />
            {isSearching && <p className="text-muted mt-1">Buscando...</p>}
            {searchResults.length > 0 && !selectedAlumno && (
              <div className="search-results">
                {searchResults.map((alumno) => (
                  <div
                    key={alumno.id}
                    className="search-result-item"
                    onClick={() => {
                      setSelectedAlumno(alumno);
                      setSearchResults([]);
                    }}
                  >
                    {alumno.apellido}, {alumno.nombre} - DNI: {alumno.dni}
                  </div>
                ))}
              </div>
            )}
            {selectedAlumno && (
              <div className="selected-item">
                <span>
                  {selectedAlumno.apellido}, {selectedAlumno.nombre} - DNI:{" "}
                  {selectedAlumno.dni}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedAlumno(null);
                    setSearchTerm("");
                  }}
                >
                  Cambiar
                </Button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Curso</label>
            <select
              className="form-select"
              value={selectedCursoId}
              onChange={(e) => setSelectedCursoId(e.target.value)}
              required
            >
              <option value="">Seleccionar curso...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.nombre} - Turno {course.turno}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeletingEnrollment(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Inscripción"
        message={`¿Está seguro de eliminar la inscripción de ${deletingEnrollment?.alumno?.nombre} ${deletingEnrollment?.alumno?.apellido}?`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isSubmitting}
        icon={Trash2}
      />
    </div>
  );
}
