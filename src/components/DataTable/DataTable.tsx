import React, { useCallback, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type {
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
  GridRenderCellParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import type { LucideIcon } from "lucide-react";
import { Database, Pencil } from "lucide-react";
import { EmptyState } from "../EmptyState";
import { Loading } from "../Loading";
import { Button } from "../Button";
import { Badge, type BadgeProps } from "../Badge";
import "./DataTable.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Chip Column Configuration
   ───────────────────────────────────────────────────────────────────────────── */

export interface ChipConfig {
  /** Map field value to label */
  labels: Record<string, string>;
  /** Map field value to Badge variant */
  variants: Record<string, BadgeProps["variant"]>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Column Definition
   ───────────────────────────────────────────────────────────────────────────── */

export interface Column<T> {
  /** Field key from data object */
  field: keyof T | string;
  /** Column header label */
  headerName: string;
  /** Column width */
  width?: number;
  /** Flex grow */
  flex?: number;
  /** Custom cell renderer (overrides type) */
  renderCell?: (row: T) => React.ReactNode;
  /** Sortable */
  sortable?: boolean;
  /** Text alignment */
  align?: "left" | "center" | "right";

  /* ── Column Type Support ─────────────────────────────────────────────────── */
  /** Column type: 'chip' renders Badge, 'actions' renders edit button */
  type?: "text" | "chip" | "actions";
  /** Chip configuration (required when type='chip') */
  chipConfig?: ChipConfig;
  /** Action click handler (used when type='actions') */
  onAction?: (row: T) => void;
  /** Action icon (default: Pencil) */
  actionIcon?: LucideIcon;
  /** Action tooltip */
  actionLabel?: string;
}

export interface DataTableProps<T extends GridValidRowModel> {
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Unique row identifier field */
  rowIdField?: keyof T;
  /** Loading state */
  isLoading?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Rows per page options */
  pageSizeOptions?: number[];
  /** Default page size */
  pageSize?: number;
  /** Total rows (for server-side pagination) */
  totalRows?: number;
  /** Current page (for server-side pagination) */
  page?: number;
  /** Page change handler (for server-side pagination) */
  onPageChange?: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Custom empty state icon */
  emptyIcon?: LucideIcon;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Checkbox selection */
  checkboxSelection?: boolean;
  /** On selection change */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Custom class name */
  className?: string;
  /** Denser row padding */
  compact?: boolean;
  /** Alternating row colors */
  striped?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableActions Helper Component
   ───────────────────────────────────────────────────────────────────────────── */

export interface ActionItem {
  /** Action label */
  label: string;
  /** Optional Lucide icon */
  icon?: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Action variant */
  variant?: "default" | "danger";
  /** Disabled state */
  disabled?: boolean;
}

export interface TableActionsProps {
  /** Array of action items */
  actions: ActionItem[];
  /** Additional CSS class */
  className?: string;
}

export const TableActions = ({
  actions,
  className = "",
}: TableActionsProps) => {
  const classNames = ["table-actions", className].filter(Boolean).join(" ");

  return (
    <div className={classNames}>
      {actions.map((action, index) => (
        <Button
          key={`${action.label}-${index}`}
          size="sm"
          variant={action.variant === "danger" ? "danger" : "ghost"}
          icon={action.icon}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
          disabled={action.disabled}
          aria-label={action.label}
          title={action.label}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   DataTable Component
   ───────────────────────────────────────────────────────────────────────────── */

export const DataTable = <T extends GridValidRowModel>({
  data,
  columns,
  rowIdField = "id" as keyof T,
  isLoading = false,
  pagination = true,
  pageSizeOptions = [5, 10, 25, 50],
  pageSize = 10,
  totalRows,
  page,
  onPageChange,
  onPageSizeChange,
  emptyMessage = "No hay datos disponibles",
  emptyIcon: EmptyIcon = Database,
  onRowClick,
  checkboxSelection = false,
  onSelectionChange,
  className = "",
  compact = false,
  striped = false,
}: DataTableProps<T>) => {
  const isServerSide = totalRows !== undefined && page !== undefined;

  // Build cell renderer based on column type
  const buildCellRenderer = useCallback((col: Column<T>) => {
    // Custom renderer takes priority
    if (col.renderCell) {
      return (params: GridRenderCellParams) => col.renderCell!(params.row as T);
    }

    // Chip type - renders Badge with configured labels/variants
    if (col.type === "chip" && col.chipConfig) {
      return (params: GridRenderCellParams) => {
        const value = String(params.value ?? "");
        const label = col.chipConfig!.labels[value] ?? value;
        const variant = col.chipConfig!.variants[value] ?? "gray";
        return <Badge variant={variant}>{label}</Badge>;
      };
    }

    // Actions type - renders edit button
    if (col.type === "actions" && col.onAction) {
      const ActionIcon = col.actionIcon ?? Pencil;
      return (params: GridRenderCellParams) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="sm"
            icon={ActionIcon}
            onClick={(e) => {
              e.stopPropagation();
              col.onAction!(params.row as T);
            }}
            title={col.actionLabel ?? "Editar"}
            aria-label={col.actionLabel ?? "Editar"}
          />
        </div>
      );
    }

    return undefined;
  }, []);

  const gridColumns: GridColDef[] = useMemo(
    () =>
      columns.map((col) => ({
        field: String(col.field),
        headerName: col.headerName,
        width: col.width,
        flex: col.flex,
        sortable: col.type === "actions" ? false : (col.sortable ?? true),
        align: col.align,
        headerAlign: col.align,
        renderCell: buildCellRenderer(col),
      })),
    [columns, buildCellRenderer],
  );

  const getRowId = useCallback(
    (row: T) => String(row[rowIdField]),
    [rowIdField],
  );

  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      if (onPageChange && model.page !== page) {
        onPageChange(model.page);
      }
      if (onPageSizeChange && model.pageSize !== pageSize) {
        onPageSizeChange(model.pageSize);
      }
    },
    [onPageChange, onPageSizeChange, page, pageSize],
  );

  const handleRowSelectionModelChange = useCallback(
    (selectionModel: GridRowSelectionModel) => {
      if (onSelectionChange) {
        onSelectionChange(selectionModel.ids as unknown as string[]);
      }
    },
    [onSelectionChange],
  );

  const handleRowClick = useCallback(
    (params: { row: T }) => {
      if (onRowClick) {
        onRowClick(params.row);
      }
    },
    [onRowClick],
  );

  const paginationModel: GridPaginationModel = useMemo(
    () => ({
      page: page ?? 0,
      pageSize: pageSize,
    }),
    [page, pageSize],
  );

  const NoRowsOverlay = useCallback(
    () => (
      <div className="data-table__empty-overlay">
        <EmptyState message={emptyMessage} icon={EmptyIcon} size="sm" />
      </div>
    ),
    [emptyMessage, EmptyIcon],
  );

  const LoadingOverlay = useCallback(
    () => (
      <div className="data-table__loading-overlay">
        <Loading size="md" message="Cargando datos..." />
      </div>
    ),
    [],
  );

  const classNames = [
    "data-table",
    compact ? "data-table--compact" : "",
    striped ? "data-table--striped" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <DataGrid
        rows={data}
        columns={gridColumns}
        getRowId={getRowId}
        loading={isLoading}
        disableColumnMenu
        disableRowSelectionOnClick={!checkboxSelection}
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={handleRowSelectionModelChange}
        onRowClick={onRowClick ? handleRowClick : undefined}
        paginationMode={isServerSide ? "server" : "client"}
        rowCount={isServerSide ? totalRows : undefined}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        hideFooter={!pagination}
        slots={{
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LoadingOverlay,
        }}
        autoHeight
        sx={{
          border: "none",
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
        }}
      />
    </div>
  );
};

// Keep backwards compatibility with legacy interface
export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export default DataTable;
