// Global environment safeguard
// Ensures window.fetch is writable even if the host environment defines it as a getter-only property.
(function () {
  try {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch ? window.fetch.bind(window) : undefined;
      let currentFetch = originalFetch;

      const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
      if (!descriptor || typeof descriptor.set !== 'function') {
        Object.defineProperty(window, 'fetch', {
          configurable: true,
          enumerable: true,
          get: () => currentFetch,
          set: (newFetch) => {
            currentFetch = newFetch;
          },
        });
      }
    }
  } catch (e) {
    // Non-critical environment handling
    console.warn('Polyfill init warning:', e);
  }
})();

export {};
