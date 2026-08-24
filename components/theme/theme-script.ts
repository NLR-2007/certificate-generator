/**
 * Runs before first paint (injected inline in the document head) so the correct
 * theme class is on <html> before React hydrates. Without this the page would
 * paint in the default theme and then flip - the classic dark-mode "flash".
 */
export const THEME_STORAGE_KEY = "klh-theme";

export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark" ? stored : null;
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;
