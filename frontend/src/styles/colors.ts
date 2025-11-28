/**
 * Palette de couleurs Homeva
 * Inspirée du logo Homeva (marron/brun et beige)
 */

export const homevaColors = {
  // Couleurs principales du logo
  brown: {
    primary: '#8B6F47',      // Marron principal du logo
    dark: '#6B5435',         // Marron foncé pour hover/états actifs
    light: '#A6895F',        // Marron clair
    veryDark: '#3D2F1F',     // Marron très foncé pour texte
    medium: '#5A4A35',       // Marron moyen
  },
  
  beige: {
    primary: '#F5E6D3',       // Beige clair du fond du logo
    dark: '#E8D4B8',          // Beige foncé pour bordures
    medium: '#D4BFA0',       // Beige moyen
    light: '#FAF0E6',         // Beige très clair
  },
  
  // Application dans le thème light
  light: {
    bgPrimary: '#ffffff',
    bgSecondary: '#F5E6D3',   // Beige clair
    textPrimary: '#3D2F1F',   // Marron foncé
    textSecondary: '#6B5435',  // Marron moyen
    borderColor: '#E8D4B8',    // Beige foncé
    accent: '#8B6F47',         // Marron principal
    accentHover: '#6B5435',    // Marron foncé
  },
  
  // Application dans le thème dark
  dark: {
    bgPrimary: '#2D2418',      // Fond sombre avec teinte marron
    bgSecondary: '#3D2F1F',    // Fond secondaire marron foncé
    textPrimary: '#F5E6D3',     // Beige clair
    textSecondary: '#D4BFA0',  // Beige moyen
    borderColor: '#5A4A35',    // Bordure marron foncé
    accent: '#A6895F',          // Marron clair
    accentHover: '#C4A87A',     // Marron très clair
  },
};

