import React, { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();

  // Appliquer la direction RTL pour l'arabe uniquement
  useEffect(() => {
    const lang = i18n.language;
    document.documentElement.dir = lang === 'ar' || lang.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [i18n.language]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content-wrapper">
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
};

