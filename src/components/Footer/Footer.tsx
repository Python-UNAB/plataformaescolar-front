import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Heart } from "lucide-react";
import "./Footer.css";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  /** Copyright text or custom content */
  copyright?: string;
  /** Optional links */
  links?: FooterLink[];
  /** Show branding icon */
  showBranding?: boolean;
  /** Additional content */
  children?: React.ReactNode;
  className?: string;
}

export const Footer = ({
  copyright,
  links,
  showBranding = true,
  children,
  className = "",
}: FooterProps) => {
  const classNames = ["footer", className].filter(Boolean).join(" ");

  const isExternalLink = (href: string): boolean => {
    return href.startsWith("http://") || href.startsWith("https://");
  };

  return (
    <footer className={classNames}>
      <div className="footer__content">
        {showBranding && (
          <div className="footer__branding">
            <GraduationCap className="footer__branding-icon" size={20} />
            <span className="footer__branding-text">Plataforma Escolar</span>
          </div>
        )}
        {children}
        {links && links.length > 0 && (
          <nav className="footer__links" aria-label="Footer navigation">
            {links.map((link, index) =>
              isExternalLink(link.href) ? (
                <a
                  key={index}
                  href={link.href}
                  className="footer__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={index} to={link.href} className="footer__link">
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        )}
        {copyright && (
          <p className="footer__copyright">
            <span>Hecho con</span>
            <Heart className="footer__heart-icon" size={14} />
            <span>{copyright}</span>
          </p>
        )}
      </div>
    </footer>
  );
};

export default Footer;
