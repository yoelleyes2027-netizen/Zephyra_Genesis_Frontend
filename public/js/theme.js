const THEME_STORAGE_KEY = 'zephyra-theme';

function applyTheme(theme) {
  const selectedTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = selectedTheme;
  localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
  return selectedTheme;
}

window.applyZephyraTheme = applyTheme;
applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'light');