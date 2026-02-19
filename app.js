/********************************
 * 1️⃣ USUARIO
 ********************************/
const USUARIO_ACTUAL = {
  id: "user_001",
  nombre: "Nicolás"
};


/********************************
 * 2️⃣ CLIENTES (FUENTE ÚNICA)
 ********************************/
function obtenerClientes() {
  let clientes = JSON.parse(localStorage.getItem("clientes"));

  if (!clientes || clientes.length === 0) {
    clientes = CLIENTES_INICIALES;
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }

  return clientes;
}


/********************************
 * 3️⃣ VISITAS
 ********************************/
function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

function guardarVisita(visita) {
  const visitas = obtenerVisitas();
  visitas.push(visita);
  localStorage.setItem("visitas_global", JSON.stringify(visitas));
}


/********************************
 * 4️⃣ MAPA
 ********************************/
let map;
let markerUsuario = null;

document.addEventListener("DOMContentLoaded", () => {
  map = L.map("map").setView([-32.4075, -63.2403], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  cargarClientesEnMapa();
  iniciarGeolocalizacion();
  mostrarVisitas();

  console.log("✅ App cargada correctamente");
});


/********************************
 * 5️⃣ CLIENTES EN MAPA
 ********************************/
function cargarClientesEnMapa() {
  const clientes = obtenerClientes();

  clientes.forEach(c => {
    L.marker([c.lat, c.lng])
      .addTo(map)
      .bindPopup(`🏭 ${c.nombre}`);
  });
}


/********************************
 * 6️⃣ GEOLOCALIZACIÓN
 ********************************/
function iniciarGeolocalizacion() {
  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    actualizarMarkerUsuario(lat, lng);
    verificarProximidad(lat, lng);
  });
}

function actualizarMarkerUsuario(lat, lng) {
  if (!markerUsuario) {
    markerUsuario = L.marker([lat, lng]).addTo(map).bindPopup("📍 Vos");
  } else {
    markerUsuario.setLatLng([lat, lng]);
  }
}


/********************************
 * 7️⃣ PROXIMIDAD
 ********************************/
function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  if (!estado || !acciones) return;

  estado.textContent = "";
  acciones.innerHTML = "";

  const clientes = obtenerClientes();
  let hayCercanos = false;

  clientes.forEach(c => {
    const d = distanciaMetros(lat, lng, c.lat, c.lng);

    if (d <= c.radio) {
      hayCercanos = true;

      const card = document.createElement("div");
      card.style.border = "1px solid #ddd";
      card.style.padding = "10px";
      card.style.marginBottom = "10px";
      card.style.borderRadius = "6px";

      const texto = document.createElement("p");
      texto.textContent = `Estás cerca de ${c.nombre}`;

      const btn = document.createElement("button");
      btn.textContent = "Registrar visita";
      btn.onclick = () => registrarVisita(c, lat, lng);

      card.appendChild(texto);
      card.appendChild(btn);
      acciones.appendChild(card);
    }
  });

  if (!hayCercanos) {
    estado.textContent = "No hay clientes cercanos";
  }
}

/********************************
 * 8️⃣ REGISTRAR VISITA
 ********************************/
function registrarVisita(cliente, lat, lng) {
  guardarVisita({
    id: Date.now(),
    clienteId: cliente.id,
    clienteNombre: cliente.nombre,
    usuarioId: USUARIO_ACTUAL.id,
    usuarioNombre: USUARIO_ACTUAL.nombre,
    fecha: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    lat,
    lng
  });

  mostrarVisitas();
  alert(`✅ Visita registrada en ${cliente.nombre}`);
}


/********************************
 * 9️⃣ HISTORIAL
 ********************************/
function mostrarVisitas() {
  const lista = document.getElementById("listaVisitas");
  if (!lista) return;

  lista.innerHTML = "";
  obtenerVisitas().slice().reverse().forEach(v => {
    const li = document.createElement("li");
    li.textContent = `${v.fecha} ${v.hora} – ${v.clienteNombre}`;
    lista.appendChild(li);
  });
}


/********************************
 * 🔟 DISTANCIA
 ********************************/
function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

