import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Breadcrumbs, type BreadcrumbItem } from '../Breadcrumbs';
import './PageHeader.css';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional icon to display next to the title */
  icon?: LucideIcon;
  /** Actions slot (typically buttons) */
  actions?: React.ReactNode;
  /** Optional breadcrumbs */
  breadcrumbs?: BreadcrumbItem[];
  /** Additional CSS class */
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumbs,
  className = '',
}: PageHeaderProps) => {
  const classNames = ['page-header', className].filter(Boolean).join(' ');

  return (
    <header className={classNames}>
      {breadcrumbs && breadcrumbs.length > 0 && (   
        <div className="page-header__breadcrumb">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className="page-header__content">
        <div className="page-header__text">
          <h1 className="page-header__title">
            {Icon && <Icon className="page-header__icon" size={28} />}
            <span>{title}</span>
          </h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
