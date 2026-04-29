import React, { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import "./Button.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
  text?: string;
}

const ICON_SIZES: Record<NonNullable<ButtonProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      icon: Icon,
      iconPosition = "left",
      children,
      className = "",
      disabled,
      text,
      ...props
    },
    ref,
  ) => {
    const sizeClass = size === "md" ? "" : `btn-${size}`;
    const isIconOnly = Icon && !children;

    const classNames = [
      "btn",
      `btn-${variant}`,
      sizeClass,
      isLoading ? "btn--loading" : "",
      isIconOnly ? "btn--icon-only" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconSize = ICON_SIZES[size];

    const renderIcon = () =>
      Icon && <Icon size={iconSize} className="btn__icon" aria-hidden="true" />;

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="btn__spinner" aria-hidden="true" />}
        <span className={isLoading ? "btn__content--hidden" : "btn__content"}>
          {iconPosition === "left" && renderIcon()}
          {children || text}
          {iconPosition === "right" && renderIcon()}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
