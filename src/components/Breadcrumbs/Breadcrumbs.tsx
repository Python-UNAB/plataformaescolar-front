import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import "./Breadcrumbs.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isHome?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  const classNames = ["breadcrumbs", className].filter(Boolean).join(" ");

  return (
    <nav className={classNames} aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          const showHomeIcon =
            isFirst &&
            (item.isHome || item.href === "/dashboard" || item.href === "/");

          return (
            <li key={index} className="breadcrumbs__item">
              {item.href && !isLast ? (
                <Link to={item.href} className="breadcrumbs__link">
                  {showHomeIcon && (
                    <Home className="breadcrumbs__home-icon" size={14} />
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={`breadcrumbs__text ${isLast ? "breadcrumbs__text--current" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {showHomeIcon && (
                    <Home className="breadcrumbs__home-icon" size={14} />
                  )}
                  <span>{item.label}</span>
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="breadcrumbs__separator"
                  size={14}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
