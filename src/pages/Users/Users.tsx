import { useState, useEffect, useCallback } from "react";
import { Users as UsersIcon, UserPlus, UserCog, UserX } from "lucide-react";
import { userService } from "../../services/user.service";
import type { User, Role } from "../../types";
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
import "./Users.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Configuration
   ───────────────────────────────────────────────────────────────────────────── */

const ROLE_OPTIONS = [
  { value: "DIRECTIVO", label: "Directivo" },
  { value: "SECRETARIO", label: "Secretario" },
  { value: "PRECEPTOR", label: "Preceptor" },
  { value: "DOCENTE", label: "Docente" },
  { value: "ALUMNO", label: "Alumno" },
];

const roleChipConfig: ChipConfig = {
  labels: {
    DIRECTIVO: "Directivo",
    SECRETARIO: "Secretario",
    PRECEPTOR: "Preceptor",
    DOCENTE: "Docente",
    ALUMNO: "Alumno",
  },
  variants: {
    DIRECTIVO: "danger",
    SECRETARIO: "warning",
    PRECEPTOR: "primary",
    DOCENTE: "success",
    ALUMNO: "gray",
  },
};

const statusChipConfig: ChipConfig = {
  labels: { true: "Activo", false: "Inactivo" },
  variants: { true: "success", false: "danger" },
};

const filterConfig: FilterConfig[] = [
  {
    name: "search",
    type: "search",
    placeholder: "Buscar por nombre, email o DNI...",
  },
  {
    name: "role",
    type: "select",
    options: [{ value: "", label: "Todos los roles" }, ...ROLE_OPTIONS],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Users Page Component
   ───────────────────────────────────────────────────────────────────────────── */

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    role: "",
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await userService.getUsers({
        page: pagination.page,
        limit: 10,
        search: filters.search || undefined,
        role: (filters.role as Role) || undefined,
      });
      setUsers(result.users);
      setPagination({
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    loadUsers();
  }, [pagination.page]);

  const handleFilter = (values: Record<string, string>) => {
    setFilters(values);
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalError("");
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalError("");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleDeactivate = async () => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await userService.deleteUser(editingUser.id);
      setConfirmOpen(false);
      handleModalClose();
      loadUsers();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Error al desactivar usuario",
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
      if (editingUser) {
        const updateData: Record<string, unknown> = {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          dni: data.dni,
          role: data.role,
          activo: data.activo,
        };
        if (data.password) updateData.password = data.password;
        await userService.updateUser(editingUser.id, updateData);
      } else {
        await userService.createUser({
          email: data.email as string,
          password: data.password as string,
          nombre: data.nombre as string,
          apellido: data.apellido as string,
          dni: data.dni as string,
          role: data.role as Role,
        });
      }
      handleModalClose();
      loadUsers();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Error al guardar usuario",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table columns configuration
  const columns: Column<User>[] = [
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      renderCell: (row) => `${row.apellido}, ${row.nombre}`,
    },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "dni", headerName: "DNI", width: 120 },
    {
      field: "role",
      headerName: "Rol",
      width: 130,
      type: "chip",
      chipConfig: roleChipConfig,
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

  // Form fields configuration
  const formFields: FormFieldConfig[] = [
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      fullWidth: false,
    },
    {
      name: "apellido",
      label: "Apellido",
      type: "text",
      required: true,
      fullWidth: false,
    },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "dni", label: "DNI", type: "text", required: true },
    {
      name: "password",
      label: editingUser
        ? "Contraseña (dejar vacío para mantener)"
        : "Contraseña",
      type: "password",
      required: !editingUser,
      placeholder:
        "Mínimo 8 caracteres, mayúscula, minúscula, número y especial",
    },
    {
      name: "role",
      label: "Rol",
      type: "select",
      required: true,
      options: ROLE_OPTIONS,
    },
    {
      name: "activo",
      label: "Usuario activo",
      type: "checkbox",
      visible: !!editingUser,
    },
  ];

  const initialValues = editingUser
    ? {
        email: editingUser.email,
        nombre: editingUser.nombre,
        apellido: editingUser.apellido,
        dni: editingUser.dni,
        role: editingUser.role,
        activo: editingUser.activo,
        password: "",
      }
    : {
        email: "",
        nombre: "",
        apellido: "",
        dni: "",
        role: "ALUMNO",
        activo: true,
        password: "",
      };

  return (
    <div className="users-page">
      <PageHeader
        title="Gestión de Usuarios"
        icon={UsersIcon}
        actions={
          <Button icon={UserPlus} onClick={handleCreate}>
            Nuevo Usuario
          </Button>
        }
      />

      <Card.Filters filters={filterConfig} onSubmit={handleFilter} />

      {error && (
        <Alert variant="error" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card.Data
        className="mt-3"
        data={users}
        columns={columns}
        rowIdField="id"
        isLoading={isLoading}
        emptyIcon={UsersIcon}
        emptyMessage="No se encontraron usuarios"
        emptyDescription="Intenta ajustar los filtros de búsqueda o crea un nuevo usuario."
        emptyAction={
          <Button icon={UserPlus} onClick={handleCreate}>
            Crear Usuario
          </Button>
        }
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: (page) => setPagination((p) => ({ ...p, page })),
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        icon={editingUser ? UserCog : UserPlus}
        fields={formFields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={modalError}
        onErrorDismiss={() => setModalError("")}
        extraActions={
          editingUser?.activo && (
            <Button
              variant="danger"
              icon={UserX}
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
        title="Desactivar Usuario"
        message={`¿Está seguro de desactivar al usuario ${editingUser?.nombre} ${editingUser?.apellido}?`}
        confirmLabel="Desactivar"
        variant="danger"
        isLoading={isSubmitting}
        icon={UserX}
      />
    </div>
  );
}
