/********************************
 * 🔥 FIREBASE
 ********************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/********************************
 * 👤 USUARIO
 ********************************/
const USUARIO_ACTUAL = {
  id: "user_001",
  nombre: "Nicolás"
};

/********************************
 * 📦 CLIENTES DESDE FIRESTORE
 ********************************/
async function obtenerClientes() {
  const snapshot = await getDocs(collection(db, "clientes"));
  const clientes = [];

  snapshot.forEach(doc => {
    const data = doc.data();

    clientes.push({
      id: doc.id,
      nombre: data.nombre || "Sin nombre",
      lat: Number(data.lat),
      lng: Number(data.lng),
      radio: Number(data.radio) || 100
    });
  });

  return clientes;
}

/********************************
 * 🗺️ MAPA
 ********************************/
let map;
let markerUsuario = null;
let marcadoresClientes = [];

document.addEventListener("DOMContentLoaded", async () => {
  map = L.map("map").setView([-32.4075, -63.2403], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  const clientes = await obtenerClientes();
  dibujarClientes(clientes);
  iniciarGeolocalizacion();

  console.log("✅ App cargada correctamente");
});

/********************************
 * 🏭 CLIENTES EN MAPA
 ********************************/
function dibujarClientes(clientes) {
  // limpiar marcadores anteriores
  marcadoresClientes.forEach(m => map.removeLayer(m));
  marcadoresClientes = [];

  clientes.forEach(c => {
    if (!c.lat || !c.lng) return;

    const marker = L.marker([c.lat, c.lng])
      .addTo(map)
      .bindPopup(`🏭 ${c.nombre}`);

    marcadoresClientes.push(marker);

    const circle = L.circle([c.lat, c.lng], {
      radius: c.radio,
      color: "#2563eb",
      fillColor: "#3b82f6",
      fillOpacity: 0.2
    }).addTo(map);

    marcadoresClientes.push(circle);
  });
}

/********************************
 * 📍 GEOLOCALIZACIÓN
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
    markerUsuario = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("📍 Vos");
  } else {
    markerUsuario.setLatLng([lat, lng]);
  }
}

/********************************
 * 📡 PROXIMIDAD
 ********************************/
async function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  if (!estado || !acciones) return;

  estado.textContent = "";
  acciones.innerHTML = "";

  const clientes = await obtenerClientes();
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
 * 📝 REGISTRAR VISITA
 ********************************/
function registrarVisita(cliente, lat, lng) {
  const visitas = JSON.parse(localStorage.getItem("visitas_global")) || [];

  visitas.push({
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

  localStorage.setItem("visitas_global", JSON.stringify(visitas));
  alert(`✅ Visita registrada en ${cliente.nombre}`);
}

/********************************
 * 📏 DISTANCIA
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
