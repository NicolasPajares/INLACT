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
 * 0️⃣ CLIENTES DESDE FIRESTORE
 ********************************/
async function obtenerClientesFirestore() {
  const snapshot = await getDocs(collection(db, "clientes"));
  const clientes = [];

  snapshot.forEach(doc => {
    clientes.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return clientes;
}
/********************************
 * 1️⃣ USUARIO
 ********************************/
const USUARIO_ACTUAL = {
  id: "user_001",
  nombre: "Nicolás"
};



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

  cargarClientesEnMapaFirestore();
  iniciarGeolocalizacion();
  mostrarVisitas();

  console.log("✅ App cargada correctamente");
});


/********************************
 * 5️⃣ CLIENTES EN MAPA
 ********************************/
async function cargarClientesEnMapa() {
  const clientes = await obtenerClientesFirestore();

  clientes.forEach(c => {
    if (!c.lat || !c.lng) return;

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
 * 7️⃣ PROXIMIDAD (FIRESTORE)
 ********************************/
async function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  if (!estado || !acciones) return;

  estado.textContent = "";
  acciones.innerHTML = "";

  // 🔥 clientes desde Firestore
  const clientes = await obtenerClientesFirestore();
  let hayCercanos = false;

  clientes.forEach(c => {
    if (!c.lat || !c.lng || !c.radio) return;

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






