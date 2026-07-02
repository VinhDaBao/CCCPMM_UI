export function applyDisplayMode(mode) {
  const root = document.documentElement;
  // remove previously-applied mode classes and dark class
  const prev = root.getAttribute('data-display-mode');
  if (prev) {
    // previous effective may have been 'dark'/'light' or 'system'
    root.classList.remove(`mode-${prev}`);
    if (prev === 'dark') root.classList.remove('dark');
  }

  // Remove any residual mode-dark/mode-light classes first
  root.classList.remove('mode-dark', 'mode-light');
  root.classList.remove('dark');

  let effective = mode;
  if (mode === 'system') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    effective = prefersDark ? 'dark' : 'light';
  }

  root.setAttribute('data-display-mode', mode);
  root.classList.add(`mode-${effective}`);

  // Also toggle the conventional 'dark' class so Tailwind 'dark:' and other libs respond
  if (effective === 'dark') root.classList.add('dark');

  // Clean up any previous media listener we stored
  try {
    if (root._themePrefersDarkListener && window.matchMedia) {
      const prevMq = window.matchMedia('(prefers-color-scheme: dark)');
      prevMq.removeEventListener?.('change', root._themePrefersDarkListener);
      delete root._themePrefersDarkListener;
    }
  } catch (e) { /* ignore */ }

  // Listen to system changes when in system mode
  if (mode === 'system' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      root.classList.toggle('mode-dark', e.matches);
      root.classList.toggle('mode-light', !e.matches);
      root.classList.toggle('dark', e.matches);
    };
    mq.addEventListener?.('change', handler);
    // store handler so we can remove it later
    root._themePrefersDarkListener = handler;
  }

  try { localStorage.setItem('app_display_mode', mode); } catch (e) { /* ignore */ }
}

export function getStoredDisplayMode() {
  try { return localStorage.getItem('app_display_mode') || 'system'; } catch (e) { return 'system'; }
}
