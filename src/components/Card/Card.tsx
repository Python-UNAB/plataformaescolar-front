import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Search, Database } from "lucide-react";
import { Button } from "../Button";
import { DataTable, type Column, type DataTableProps } from "../DataTable";
import { Loading } from "../Loading";
import { EmptyState } from "../EmptyState";
import type { GridValidRowModel } from "@mui/x-data-grid";
import "./Card.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Filter Configuration
   ───────────────────────────────────────────────────────────────────────────── */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  /** Filter name/key */
  name: string;
  /** Filter type */
  type: "search" | "select";
  /** Placeholder text */
  placeholder?: string;
  /** Options for select filter */
  options?: FilterOption[];
  /** Default value */
  defaultValue?: string;
}

export interface FiltersProps {
  /** Filter configurations */
  filters: FilterConfig[];
  /** Submit callback with filter values */
  onSubmit: (values: Record<string, string>) => void;
  /** Search button label */
  searchLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   DataCard Configuration
   ───────────────────────────────────────────────────────────────────────────── */

export interface PaginationConfig {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface DataCardProps<T extends GridValidRowModel> {
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Row ID field */
  rowIdField?: keyof T;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state icon */
  emptyIcon?: LucideIcon;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Empty state action */
  emptyAction?: React.ReactNode;
  /** Pagination config (omit for no pagination) */
  pagination?: PaginationConfig;
  /** Additional DataTable props */
  tableProps?: Partial<DataTableProps<T>>;
  /** Additional class name */
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Base Card Props
   ───────────────────────────────────────────────────────────────────────────── */

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardActionProps {
  /** The icon to display */
  icon: React.ReactNode;
  /** The action title */
  title: string;
  /** Optional description text */
  subtitle?: string;
  /** The route path */
  to: string;
  /** Additional CSS class */
  className?: string;
}

export interface CardStatProps {
  /** The icon to display */
  icon: React.ReactNode;
  /** The stat label */
  label: string;
  /** The stat value */
  value: string | number;
  /** Additional CSS class */
  className?: string;
}

const CardHeader = ({ children, className = "" }: CardHeaderProps) => (
  <div className={`card-header ${className}`.trim()}>{children}</div>
);

const CardBody = ({ children, className = "" }: CardBodyProps) => (
  <div className={`card-body ${className}`.trim()}>{children}</div>
);

const CardFooter = ({ children, className = "" }: CardFooterProps) => (
  <div className={`card-footer ${className}`.trim()}>{children}</div>
);

const CardAction = ({
  icon,
  title,
  subtitle,
  to,
  className = "",
}: CardActionProps) => (
  <Link to={to} className={`card-action ${className}`.trim()}>
    <div className="card-action-icon">{icon}</div>
    <div className="card-action-content">
      <span className="card-action-title">{title}</span>
      {subtitle && <span className="card-action-subtitle">{subtitle}</span>}
    </div>
  </Link>
);

const CardStat = ({ icon, label, value, className = "" }: CardStatProps) => (
  <div className={`card-stat ${className}`.trim()}>
    <div className="card-stat-icon">{icon}</div>
    <span className="card-stat-label">{label}</span>
    <span className="card-stat-value">{value}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Card.Filters - Filter form component
   ───────────────────────────────────────────────────────────────────────────── */

const CardFilters = ({
  filters,
  onSubmit,
  searchLabel = "Buscar",
}: FiltersProps) => {
  const getInitialValues = useCallback(() => {
    const values: Record<string, string> = {};
    filters.forEach((f) => {
      values[f.name] = f.defaultValue ?? "";
    });
    return values;
  }, [filters]);

  const [values, setValues] =
    useState<Record<string, string>>(getInitialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const updateValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit} className="card-filters">
          {filters.map((filter) => (
            <div key={filter.name} className="card-filters__group">
              {filter.type === "search" ? (
                <input
                  type="text"
                  className="form-input"
                  placeholder={filter.placeholder}
                  value={values[filter.name] || ""}
                  onChange={(e) => updateValue(filter.name, e.target.value)}
                />
              ) : (
                <select
                  className="form-select"
                  value={values[filter.name] || ""}
                  onChange={(e) => updateValue(filter.name, e.target.value)}
                >
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          <Button type="submit" variant="secondary" icon={Search}>
            {searchLabel}
          </Button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Card.Data - Data table with loading/empty states
   ───────────────────────────────────────────────────────────────────────────── */

function CardData<T extends GridValidRowModel>({
  data,
  columns,
  rowIdField = "id" as keyof T,
  isLoading = false,
  emptyIcon = Database,
  emptyMessage = "No hay datos",
  emptyDescription,
  emptyAction,
  pagination,
  tableProps,
  className = "",
}: DataCardProps<T>) {
  const EmptyIcon = emptyIcon;

  return (
    <div className={`card ${className}`.trim()}>
      {isLoading ? (
        <Loading message="Cargando datos..." />
      ) : data.length === 0 ? (
        <EmptyState
          icon={EmptyIcon}
          message={emptyMessage}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <>
          <DataTable
            data={data}
            columns={columns}
            rowIdField={rowIdField}
            pagination={false}
            {...tableProps}
          />
          {pagination && pagination.totalPages > 1 && (
            <div className="card-footer">
              <div className="card-pagination">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                >
                  Anterior
                </Button>
                <span>
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const CardRoot = ({ children, className = "" }: CardProps) => (
  <div className={`card ${className}`.trim()}>{children}</div>
);

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Action: CardAction,
  Stat: CardStat,
  Filters: CardFilters,
  Data: CardData,
});

export default Card;
