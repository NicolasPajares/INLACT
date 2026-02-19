/********************************
 * 🔥 FIREBASE (IMPORTS PRIMERO)
 ********************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/********************************
 * ⚙️ CONFIG FIREBASE
 ********************************/
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

/********************************
 * 📦 OBTENER CLIENTES
 ********************************/
async function obtenerClientes() {
  try {
    const snapshot = await getDocs(collection(db, "clientes"));
    const clientes = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      clientes.push({
        id: doc.id,
        nombre: data.nombre,
        lat: Number(data.lat),
        lng: Number(data.lng),
        radio: Number(data.radio) || 100
      });
    });

    return clientes;
  } catch (e) {
    console.error("ERROR FIRESTORE:", e);
    return [];
  }
}

/********************************
 * 🗺️ MAPA
 ********************************/
let map;
let markerUsuario = null;

document.addEventListener("DOMContentLoaded", async () => {
  map = L.map("map").setView([-32.4075, -63.2403], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  const clientes = await obtenerClientes();

  clientes.forEach(c => {
    L.marker([c.lat, c.lng]).addTo(map).bindPopup(c.nombre);
  });

  iniciarGeolocalizacion();
});

/********************************
 * 📍 GEOLOCALIZACIÓN
 ********************************/
function iniciarGeolocalizacion() {
  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if (!markerUsuario) {
      markerUsuario = L.marker([lat, lng]).addTo(map).bindPopup("📍 Vos");
    } else {
      markerUsuario.setLatLng([lat, lng]);
    }
  });
}
