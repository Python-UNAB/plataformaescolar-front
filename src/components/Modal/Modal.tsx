import React, { useEffect, useRef, useCallback, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { Button } from "../Button";
import { Alert } from "../Alert";
import "./Modal.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Form Field Types
   ───────────────────────────────────────────────────────────────────────────── */

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormFieldBase {
  /** Field name (key in form data) */
  name: string;
  /** Field label */
  label: string;
  /** Required field */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Field spans full width (default) or half */
  fullWidth?: boolean;
  /** Visible condition */
  visible?: boolean;
}

export interface TextFieldConfig extends FormFieldBase {
  type: "text" | "email" | "password" | "number" | "tel";
}

export interface SelectFieldConfig extends FormFieldBase {
  type: "select";
  options: SelectOption[];
}

export interface CheckboxFieldConfig extends FormFieldBase {
  type: "checkbox";
}

export interface TextareaFieldConfig extends FormFieldBase {
  type: "textarea";
  rows?: number;
}

export type FormFieldConfig =
  | TextFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | TextareaFieldConfig;

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Props
   ───────────────────────────────────────────────────────────────────────────── */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  /** Content - use children OR fields for form mode */
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";

  /* ── Form Mode Props ───────────────────────────────────────────────────── */
  /** Form fields configuration (enables form mode) */
  fields?: FormFieldConfig[];
  /** Initial form values */
  initialValues?: Record<string, unknown>;
  /** Form submit handler */
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  /** Submit button text */
  submitLabel?: string;
  /** Cancel button text */
  cancelLabel?: string;
  /** Form is submitting */
  isSubmitting?: boolean;
  /** Error message to display */
  error?: string;
  /** Clear error callback */
  onErrorDismiss?: () => void;
  /** Additional actions in footer (left side) */
  extraActions?: React.ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  footer,
  maxWidth = "md",
  // Form mode props
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  error,
  onErrorDismiss,
  extraActions,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const isFormMode = !!fields && fields.length > 0;

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && isFormMode) {
      const initial: Record<string, unknown> = {};
      fields.forEach((field) => {
        initial[field.name] =
          initialValues[field.name] ?? (field.type === "checkbox" ? false : "");
      });
      setFormData(initial);
    }
  }, [isOpen, fields, initialValues, isFormMode]);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    // Focus the modal for accessibility
    modalRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      previousActiveElement.current?.focus();
    };
  }, [isOpen, handleEscape]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTabKey);
    return () => modal.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className={`modal modal--${maxWidth}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="modal-header">
          <div className="modal-header__title-wrapper">
            {Icon && (
              <Icon
                size={22}
                className="modal-header__icon"
                aria-hidden="true"
              />
            )}
            <h2 id="modal-title" className="modal-header__title">
              {title}
            </h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">
          {isFormMode ? (
            <FormContent
              fields={fields}
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              error={error}
              onErrorDismiss={onErrorDismiss}
            />
          ) : (
            children
          )}
        </div>
        {isFormMode ? (
          <div className="modal-footer">
            {extraActions && (
              <div className="modal-footer__extra">{extraActions}</div>
            )}
            <div className="modal-footer__actions">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
              <Button type="submit" form="modal-form" isLoading={isSubmitting}>
                {submitLabel}
              </Button>
            </div>
          </div>
        ) : (
          footer && <div className="modal-footer">{footer}</div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   FormContent - Internal form renderer
   ───────────────────────────────────────────────────────────────────────────── */

interface FormContentProps {
  fields: FormFieldConfig[];
  formData: Record<string, unknown>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  isSubmitting: boolean;
  error?: string;
  onErrorDismiss?: () => void;
}

function FormContent({
  fields,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  error,
  onErrorDismiss,
}: FormContentProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const updateField = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const visibleFields = fields.filter((f) => f.visible !== false);

  // Group fields: full-width fields get their own row, half-width fields are paired
  const rows: FormFieldConfig[][] = [];
  let currentRow: FormFieldConfig[] = [];

  visibleFields.forEach((field) => {
    if (field.fullWidth !== false && field.type !== "checkbox") {
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
      }
      rows.push([field]);
    } else {
      currentRow.push(field);
      if (currentRow.length === 2) {
        rows.push(currentRow);
        currentRow = [];
      }
    }
  });
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return (
    <form id="modal-form" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="error" onDismiss={onErrorDismiss}>
          {error}
        </Alert>
      )}

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={row.length > 1 ? "form-row" : undefined}>
          {row.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={(value) => updateField(field.name, value)}
              disabled={isSubmitting}
            />
          ))}
        </div>
      ))}
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FormField - Single field renderer
   ───────────────────────────────────────────────────────────────────────────── */

interface FormFieldProps {
  field: FormFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
}

function FormField({ field, value, onChange, disabled }: FormFieldProps) {
  if (field.type === "checkbox") {
    return (
      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <span>{field.label}</span>
        </label>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="form-group">
        <label className="form-label">{field.label}</label>
        <select
          className="form-select"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={disabled}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="form-group">
        <label className="form-label">{field.label}</label>
        <textarea
          className="form-input form-textarea"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          disabled={disabled}
          rows={field.rows ?? 3}
        />
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="form-label">{field.label}</label>
      <input
        type={field.type}
        className="form-input"
        value={String(value ?? "")}
        onChange={(e) =>
          onChange(
            field.type === "number" ? Number(e.target.value) : e.target.value,
          )
        }
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ConfirmDialog - Confirmation dialog component
   ───────────────────────────────────────────────────────────────────────────── */

export interface ConfirmDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Confirm callback */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Confirm button text */
  confirmLabel?: string;
  /** Cancel button text */
  cancelLabel?: string;
  /** Confirm button variant */
  variant?: "primary" | "danger";
  /** Loading state */
  isLoading?: boolean;
  /** Optional icon */
  icon?: LucideIcon;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button variant={variant} onClick={handleConfirm} isLoading={isLoading}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      footer={footer}
      maxWidth="sm"
    >
      <p className="confirm-dialog__message">{message}</p>
    </Modal>
  );
}

export default Modal;
