import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const getCurrentLang = () => {
    const lang = i18n.language;
    if (lang === 'ar' || lang.startsWith('ar')) return 'ar';
    if (lang === 'en' || lang.startsWith('en')) return 'en';
    return 'fr';
  };

  const currentLang = getCurrentLang();

  return (
    <div className="language-switcher">
      <select
        value={currentLang}
        onChange={changeLanguage}
        className="language-select"
        aria-label="Select language"
      >
        <option value="fr">🇫🇷 FR</option>
        <option value="en">🇬🇧 EN</option>
        <option value="ar">🇸🇦 AR</option>
      </select>
    </div>
  );
};

