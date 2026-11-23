import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import { App } from './App';

// Each deploy replaces the hashed chunks on GitHub Pages, so a tab still running
// an older build (or an old index.html served from cache) can request a lazy
// chunk that no longer exists ("Failed to fetch dynamically imported module").
// Vite fires 'vite:preloadError' when that happens; reloading once picks up the
// new index.html and its current chunk names.
// The timestamp in sessionStorage stops a reload loop: if the error comes back
// within 10s of our last reload, the chunk is genuinely broken, so we leave the
// error alone and let the existing error handling deal with it.
const PRELOAD_RELOAD_KEY = 'cvire:preload-error-reload-at';
const PRELOAD_RELOAD_WINDOW_MS = 10_000;

window.addEventListener('vite:preloadError', (event) => {
  try {
    const lastReloadAt = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY));
    if (lastReloadAt && Date.now() - lastReloadAt < PRELOAD_RELOAD_WINDOW_MS) {
      return;
    }
    sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
  } catch {
    // Without sessionStorage we can't guard against a reload loop, so don't reload.
    return;
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
