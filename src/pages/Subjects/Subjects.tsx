import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, XCircle } from "lucide-react";
import { courseService } from "../../services/course.service";
import { subjectService } from "../../services/subject.service";
import { userService } from "../../services/user.service";
import type { Subject, Course, User } from "../../types";
import {
  Button,
  Card,
  Modal,
  ConfirmDialog,
  PageHeader,
  Alert,
  type Column,
  type FormFieldConfig,
  type ChipConfig,
  type FilterConfig,
} from "../../components";
import "./Subjects.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Configuration
   ───────────────────────────────────────────────────────────────────────────── */

const statusChipConfig: ChipConfig = {
  labels: { true: "Activo", false: "Inactivo" },
  variants: { true: "success", false: "danger" },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Subjects Page Component
   ───────────────────────────────────────────────────────────────────────────── */

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [docentes, setDocentes] = useState<
    Pick<User, "id" | "nombre" | "apellido" | "email">[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    cursoId: "",
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subjectsData, coursesData, docentesData] = await Promise.all([
        subjectService.getSubjects({ cursoId: filters.cursoId || undefined }),
        courseService.getCourses({ anio: currentYear, activo: true }),
        userService.getDocentes(),
      ]);
      setSubjects(subjectsData);
      setCourses(coursesData);
      setDocentes(docentesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [filters.cursoId, currentYear]);

  useEffect(() => {
    loadData();
  }, [filters.cursoId]);

  const handleFilter = (values: Record<string, string>) => {
    setFilters(values);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setModalError("");
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setModalError("");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSubject(null);
  };

  const handleDeactivate = async () => {
    if (!editingSubject) return;

    setIsSubmitting(true);
    try {
      await subjectService.deleteSubject(editingSubject.id);
      setConfirmOpen(false);
      handleModalClose();
      loadData();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Error al desactivar materia",
      );
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setModalError("");
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, {
          nombre: data.nombre as string,
          docenteId: (data.docenteId as string) || undefined,
          activo: data.activo as boolean,
        });
      } else {
        await subjectService.createSubject({
          nombre: data.nombre as string,
          cursoId: data.cursoId as string,
          docenteId: (data.docenteId as string) || undefined,
        });
      }
      handleModalClose();
      loadData();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Error al guardar materia",
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
          label: `${c.nombre} (${c.anio})`,
        })),
      ],
    },
  ];

  // Table columns configuration
  const columns: Column<Subject>[] = [
    {
      field: "nombre",
      headerName: "Materia",
      flex: 1,
      renderCell: (row) => <strong>{row.nombre}</strong>,
    },
    {
      field: "curso",
      headerName: "Curso",
      flex: 1,
      renderCell: (row) => `${row.curso?.nombre} (${row.curso?.anio})`,
    },
    {
      field: "docente",
      headerName: "Docente",
      flex: 1,
      renderCell: (row) =>
        row.docente ? (
          `${row.docente.apellido}, ${row.docente.nombre}`
        ) : (
          <span className="text-muted">Sin asignar</span>
        ),
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
      type: "actions",
      onAction: handleEdit,
    },
  ];

  // Form fields configuration (dynamic with courses and docentes)
  const courseOptions = [
    { value: "", label: "Seleccionar curso..." },
    ...courses.map((c) => ({
      value: c.id,
      label: `${c.nombre} (${c.anio}) - Turno ${c.turno}`,
    })),
  ];

  const docenteOptions = [
    { value: "", label: "Sin asignar" },
    ...docentes.map((d) => ({
      value: d.id,
      label: `${d.apellido}, ${d.nombre}`,
    })),
  ];

  const formFields: FormFieldConfig[] = [
    {
      name: "nombre",
      label: "Nombre de la Materia",
      type: "text",
      required: true,
      placeholder: "Ej: Matemáticas, Lengua, Historia",
    },
    {
      name: "cursoId",
      label: "Curso",
      type: "select",
      required: true,
      options: courseOptions,
      visible: !editingSubject,
    },
    {
      name: "docenteId",
      label: "Docente a Cargo",
      type: "select",
      options: docenteOptions,
    },
    {
      name: "activo",
      label: "Materia activa",
      type: "checkbox",
      visible: !!editingSubject,
    },
  ];

  const initialValues = editingSubject
    ? {
        nombre: editingSubject.nombre,
        cursoId: editingSubject.cursoId,
        docenteId: editingSubject.docenteId || "",
        activo: editingSubject.activo,
      }
    : { nombre: "", cursoId: "", docenteId: "", activo: true };

  return (
    <div className="subjects-page">
      <PageHeader
        title="Gestión de Materias"
        icon={BookOpen}
        actions={
          <Button icon={Plus} onClick={handleCreate}>
            Nueva Materia
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
        data={subjects}
        columns={columns}
        rowIdField="id"
        isLoading={isLoading}
        emptyIcon={BookOpen}
        emptyMessage="No hay materias registradas"
        emptyDescription="Crea una nueva materia para comenzar."
        emptyAction={
          <Button icon={Plus} onClick={handleCreate}>
            Nueva Materia
          </Button>
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={editingSubject ? "Editar Materia" : "Nueva Materia"}
        icon={BookOpen}
        fields={formFields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={modalError}
        onErrorDismiss={() => setModalError("")}
        extraActions={
          editingSubject?.activo && (
            <Button
              variant="danger"
              icon={XCircle}
              onClick={() => setConfirmOpen(true)}
              disabled={isSubmitting}
            >
              Desactivar
            </Button>
          )
        }
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeactivate}
        title="Desactivar Materia"
        message={`¿Está seguro de desactivar la materia ${editingSubject?.nombre}?`}
        confirmLabel="Desactivar"
        variant="danger"
        isLoading={isSubmitting}
        icon={XCircle}
      />
    </div>
  );
}
