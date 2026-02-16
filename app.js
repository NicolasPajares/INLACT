/********************************
 * 1️⃣ DATOS (MODELO)
 ********************************/

// Usuario simulado
const USUARIO_ACTUAL = {
  id: "user_001",
  nombre: "Nicolás"
};

// Clientes / fábricas
const fabricas = [
  {
    id: "fabrica_001",
    nombre: "Depósito Casa",
    lat: -32.3833,
    lng: -63.2243,
    radio: 10000,
    tipo: "cliente"
  }
];


/********************************
 * 2️⃣ STORAGE (localStorage)
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
 * 3️⃣ MAPA (Leaflet)
 ********************************/

let map;
let markerUsuario = null;

document.addEventListener("DOMContentLoaded", () => {

  // Crear mapa
  map = L.map("map").setView([-32.4075, -63.2403], 13); // Villa María

  // Capa OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // Cargar clientes
  cargarFabricasEnMapa();

  // Iniciar geolocalización
  iniciarGeolocalizacion();

  console.log("Mapa cargado correctamente");
});


/********************************
 * 4️⃣ CARGAR FABRICAS EN MAPA
 ********************************/

function cargarFabricasEnMapa() {
  fabricas.forEach(f => {
    L.marker([f.lat, f.lng])
      .addTo(map)
      .bindPopup(`🏭 ${f.nombre}`);
  });

  // Click para agregar nuevo cliente
  map.on("click", (e) => {
    const nombre = prompt("Nombre del cliente/fábrica:");
    if (!nombre) return;

    const nueva = {
      id: "fabrica_" + Date.now(),
      nombre,
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      radio: 1000,
      tipo: "cliente"
    };

    fabricas.push(nueva);

    L.marker([nueva.lat, nueva.lng])
      .addTo(map)
      .bindPopup(`🏭 ${nueva.nombre}`);
  });
}


/********************************
 * 5️⃣ GEOLOCALIZACIÓN USUARIO
 ********************************/

function iniciarGeolocalizacion() {
  if (!navigator.geolocation) {
    alert("Geolocalización no soportada");
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      actualizarMarkerUsuario(lat, lng);
      verificarProximidad(lat, lng);
    },
    (err) => {
      console.error("Error geolocalización", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    }
  );
}

function actualizarMarkerUsuario(lat, lng) {
  if (!markerUsuario) {
    markerUsuario = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }).addTo(map).bindPopup("📍 Vos");
  } else {
    markerUsuario.setLatLng([lat, lng]);
  }
}


/********************************
 * 6️⃣ PROXIMIDAD A CLIENTES
 ********************************/

function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  acciones.innerHTML = "";
  let encontrada = false;

  fabricas.forEach(f => {
    const d = distanciaMetros(lat, lng, f.lat, f.lng);

    if (d <= f.radio) {
      encontrada = true;
      estado.textContent = `Estás cerca de ${f.nombre}`;

      const btn = document.createElement("button");
      btn.textContent = "Registrar visita";

      btn.onclick = () => registrarVisita(f, lat, lng);

      acciones.appendChild(btn);
    }
  });

  if (!encontrada) {
    estado.textContent = "No hay fábricas cercanas";
  }
}


/********************************
 * 7️⃣ REGISTRAR VISITA
 ********************************/

function registrarVisita(fabrica, lat, lng) {
  const visita = {
    id: Date.now(),
    clienteId: fabrica.id,
    cliente: fabrica.nombre,

    usuarioId: USUARIO_ACTUAL.id,
    usuarioNombre: USUARIO_ACTUAL.nombre,

    fecha: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    lat,
    lng
  };

  guardarVisita(visita);
  mostrarVisitas();

  alert(`Visita registrada en ${fabrica.nombre}`);
}


/********************************
 * 8️⃣ HISTORIAL VISITAS
 ********************************/

function mostrarVisitas() {
  const lista = document.getElementById("listaVisitas");
  if (!lista) return;

  lista.innerHTML = "";

  const visitas = obtenerVisitas().slice().reverse();

  visitas.forEach(v => {
    const li = document.createElement("li");
    li.textContent = `${v.fecha} ${v.hora} – ${v.cliente}`;
    lista.appendChild(li);
  });
}


/********************************
 * 9️⃣ UTILIDAD DISTANCIA
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
