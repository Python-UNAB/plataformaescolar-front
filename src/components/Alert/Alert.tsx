import React from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import "./Alert.css";

export interface AlertProps {
  /** Alert content */
  children: React.ReactNode;
  /** Visual variant */
  variant: "success" | "error" | "warning" | "info";
  /** Optional alert title */
  title?: string;
  /** Optional dismiss callback - shows close button when provided */
  onDismiss?: () => void;
  /** Optional custom icon - pass null to hide icon */
  icon?: LucideIcon | null;
  /** Additional CSS class */
  className?: string;
}

const DEFAULT_ICONS: Record<AlertProps["variant"], LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Alert = ({
  children,
  variant,
  title,
  onDismiss,
  icon,
  className = "",
}: AlertProps) => {
  const classNames = ["alert", `alert--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const IconComponent = icon === undefined ? DEFAULT_ICONS[variant] : icon;

  return (
    <div className={classNames} role="alert">
      {IconComponent && (
        <div className="alert__icon">
          <IconComponent size={20} aria-hidden="true" />
        </div>
      )}
      <div className="alert__content">
        {title && <h4 className="alert__title">{title}</h4>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button
          className="alert__dismiss"
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss alert"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Alert;
