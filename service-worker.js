// Service worker inicial de INLACT.
// No guarda páginas ni datos de clientes en caché.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// La aplicación continúa usando la red normalmente.
// No se interceptan solicitudes de Firebase ni datos privados.
