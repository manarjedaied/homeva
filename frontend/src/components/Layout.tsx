import React, { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './nav';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();

  // Appliquer la direction RTL pour l'arabe uniquement
  useEffect(() => {
    const lang = i18n.language;
    document.documentElement.dir = lang === 'ar' || lang.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [i18n.language]);

  return (
    <div className="layout">
      <Navbar />
      <main className="main">{children}</main>
      <footer className="footer">
        <p>
          &copy; 2026 Homeva.{' '}
          {i18n.language === 'ar' 
            ? 'جميع الحقوق محفوظة' 
            : i18n.language === 'en'
            ? 'All rights reserved'
            : 'Tous droits réservés'}
        </p>
      </footer>
    </div>
  );
};

