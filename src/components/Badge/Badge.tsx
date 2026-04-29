import React from "react";
import type { LucideIcon } from "lucide-react";
import "./Badge.css";

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual variant */
  variant: "primary" | "success" | "warning" | "danger" | "gray";
  /** Size variant */
  size?: "sm" | "md";
  /** Pill shape (fully rounded) vs rounded corners */
  pill?: boolean;
  /** Optional icon */
  icon?: LucideIcon;
  /** Additional CSS class */
  className?: string;
}

const ICON_SIZES: Record<NonNullable<BadgeProps["size"]>, number> = {
  sm: 10,
  md: 12,
};

export const Badge = ({
  children,
  variant,
  size = "md",
  pill = true,
  icon: Icon,
  className = "",
}: BadgeProps) => {
  const classNames = [
    "badge",
    `badge--${variant}`,
    `badge--${size}`,
    pill ? "badge--pill" : "badge--rounded",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classNames}>
      {Icon && (
        <Icon
          size={ICON_SIZES[size]}
          className="badge__icon"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
