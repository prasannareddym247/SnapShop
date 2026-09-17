import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ config = {}, children }) {
  const palette = config.palette || {};
  const typography = config.typography || {};

  // Inject CSS variables to document head/root dynamically
  useEffect(() => {
    const root = document.documentElement;
    if (palette.primary) root.style.setProperty('--primary-color', palette.primary);
    if (palette.secondary) root.style.setProperty('--secondary-color', palette.secondary);
    if (palette.accent) root.style.setProperty('--accent-color', palette.accent);
    if (palette.bg) root.style.setProperty('--bg-color', palette.bg);
    if (palette.bgAlt) root.style.setProperty('--bg-alt-color', palette.bgAlt);
    if (palette.surface) root.style.setProperty('--surface-color', palette.surface);
    if (palette.text) root.style.setProperty('--text-color', palette.text);
    if (palette.textMuted) root.style.setProperty('--text-muted', palette.textMuted);
    if (palette.border) root.style.setProperty('--border-color', palette.border);
    if (palette.success) root.style.setProperty('--success-color', palette.success);
    if (palette.error) root.style.setProperty('--error-color', palette.error);

    // Font families
    if (typography.bodyFont) root.style.setProperty('--body-font', typography.bodyFont);
    if (typography.headingFont) root.style.setProperty('--heading-font', typography.headingFont);
  }, [config]);

  return (
    <ThemeContext.Provider value={{ config, palette, typography }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      config: {},
      palette: {},
      typography: {}
    };
  }
  return context;
}
