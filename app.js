/**********************
 * MANEJO DE ERRORES *
 **********************/
window.onerror = function (msg, url, line, col) {
  alert(
    "ERROR:\n" +
    msg +
    "\nLínea: " + line +
    "\nCol: " + col
  );
};

/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.appspot.com",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Firebase inicializado");

/**********************
 * MAPA
 **********************/
let map;
let markerUsuario;

map = L.map("map").setView([-32.4075, -63.2408], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/**********************
 * OBTENER CLIENTES
 **********************/
async function obtenerClientes() {
  const snap = await getDocs(collection(db, "clientes"));
  const clientes = [];
  snap.forEach(doc => {
    clientes.push({ id: doc.id, ...doc.data() });
  });
  return clientes;
}

/**********************
 * DISTANCIA EN METROS
 **********************/
function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**********************
 * VERIFICAR CERCANÍA
 **********************/
async function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  estado.textContent = "";
  acciones.innerHTML = "";

  const clientes = await obtenerClientes();
  let hayCercanos = false;

  clientes.forEach(c => {
    if (!c.lat || !c.lng || !c.radio) return;

    const d = distanciaMetros(lat, lng, c.lat, c.lng);

    if (d <= c.radio) {
      hayCercanos = true;

      const card = document.createElement("div");
      card.style.border = "1px solid #e5e7eb";
      card.style.padding = "12px";
      card.style.marginBottom = "10px";
      card.style.borderRadius = "8px";
      card.style.background = "#fff";

      const nombre = document.createElement("strong");
      nombre.textContent = c.nombre;

      const btn = document.createElement("button");
      btn.textContent = "Registrar visita";
      btn.style.display = "block";
      btn.style.marginTop = "8px";
      btn.style.padding = "8px 12px";
      btn.style.background = "#2563eb";
      btn.style.color = "#fff";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";

      btn.onclick = () => registrarVisita(c, lat, lng);

      card.appendChild(nombre);
      card.appendChild(btn);
      acciones.appendChild(card);
    }
  });

  if (!hayCercanos) {
    estado.textContent = "No hay clientes cercanos";
  }
}

/**********************
 * REGISTRAR VISITA
 **********************/
async function registrarVisita(cliente, lat, lng) {
  await addDoc(collection(db, "visitas"), {
    clienteId: cliente.id,
    cliente: cliente.nombre,
    lat,
    lng,
    fecha: serverTimestamp()
  });

  alert("✅ Visita registrada en " + cliente.nombre);
}

/**********************
 * GEOLOCALIZACIÓN
 **********************/
navigator.geolocation.watchPosition(
  pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if (!markerUsuario) {
      markerUsuario = L.marker([lat, lng]).addTo(map);
      map.setView([lat, lng], 15);
    } else {
      markerUsuario.setLatLng([lat, lng]);
    }

    verificarProximidad(lat, lng);
  },
  err => {
    alert("Error de geolocalización");
  },
  {
    enableHighAccuracy: true
  }
);
