import React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import "./EmptyState.css";

export interface EmptyStateProps {
  /** Main message */
  message: string;
  /** Optional description */
  description?: string;
  /** Optional action button */
  action?: React.ReactNode;
  /** Optional icon - defaults to Inbox */
  icon?: LucideIcon;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS class */
  className?: string;
}

const ICON_SIZES: Record<NonNullable<EmptyStateProps["size"]>, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

export const EmptyState = ({
  message,
  description,
  action,
  icon: Icon = Inbox,
  size = "md",
  className = "",
}: EmptyStateProps) => {
  const classNames = ["empty-state", `empty-state--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <div className="empty-state__icon">
        <Icon size={ICON_SIZES[size]} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="empty-state__message">{message}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
