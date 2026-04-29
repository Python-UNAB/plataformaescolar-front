import React from "react";
import { Loader2 } from "lucide-react";
import "./Loading.css";

export interface LoadingProps {
  /** Full page loading overlay vs inline spinner */
  fullPage?: boolean;
  /** Optional loading message */
  message?: string;
  /** Spinner size */
  size?: "sm" | "md" | "lg";
  /** Additional overlay mode (semi-transparent background) */
  overlay?: boolean;
  /** Additional CSS class */
  className?: string;
}

const SPINNER_SIZES: Record<NonNullable<LoadingProps["size"]>, number> = {
  sm: 24,
  md: 40,
  lg: 56,
};

export const Loading = ({
  fullPage = false,
  message,
  size = "md",
  overlay = false,
  className = "",
}: LoadingProps) => {
  const classNames = [
    "loading",
    `loading--${size}`,
    fullPage ? "loading--full-page" : "",
    overlay ? "loading--overlay" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <Loader2
        size={SPINNER_SIZES[size]}
        className="loading__spinner"
        aria-hidden="true"
      />
      {message && <p className="loading__text">{message}</p>}
    </div>
  );
};

export default Loading;
