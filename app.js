// ===============================
// ESTADO INTERNO
// ===============================
let clientesCercanosRenderizados = new Set();
let watchId = null;

// ===============================
// INICIO APP
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  iniciarGeolocalizacion();
});

// ===============================
// GEOLOCALIZACIÓN
// ===============================
function iniciarGeolocalizacion() {
  if (!navigator.geolocation) {
    alert("Geolocalización no soportada");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      verificarProximidad(lat, lng);
    },
    err => {
      console.error("Error geolocalización:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000
    }
  );
}

// ===============================
// VERIFICAR CLIENTES CERCANOS
// ===============================
async function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  const clientes = await obtenerClientes();
  let hayCercanos = false;
  let clientesActuales = new Set();

  clientes.forEach(c => {
    if (!c.lat || !c.lng || !c.radio) return;

    const d = distanciaMetros(lat, lng, c.lat, c.lng);

    if (d <= c.radio) {
      hayCercanos = true;
      clientesActuales.add(c.id);

      // 🛑 Ya está renderizado → no tocar
      if (clientesCercanosRenderizados.has(c.id)) return;

      clientesCercanosRenderizados.add(c.id);

      // ===============================
      // CARD CLIENTE
      // ===============================
      const card = document.createElement("div");
      card.className = "cliente-card";
      card.dataset.id = c.id;

      const nombre = document.createElement("span");
      nombre.className = "cliente-nombre";
      nombre.textContent = c.nombre;

      const btn = document.createElement("button");
      btn.textContent = "Registrar visita";
      btn.onclick = () => registrarVisita(c, lat, lng);

      card.appendChild(nombre);
      card.appendChild(btn);
      acciones.appendChild(card);
    }
  });

  // ===============================
  // LIMPIAR CLIENTES QUE YA NO ESTÁN CERCA
  // ===============================
  clientesCercanosRenderizados.forEach(id => {
    if (!clientesActuales.has(id)) {
      const card = acciones.querySelector(`[data-id="${id}"]`);
      if (card) card.remove();
      clientesCercanosRenderizados.delete(id);
    }
  });

  // ===============================
  // ESTADO TEXTO
  // ===============================
  if (!hayCercanos) {
    estado.textContent = "No hay clientes cercanos";
    acciones.innerHTML = "";
    clientesCercanosRenderizados.clear();
  } else {
    estado.textContent = "";
  }
}

// ===============================
// DISTANCIA EN METROS (HAVERSINE)
// ===============================
function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
