/**********************
- MANEJO DE ERRORES
**********************/
window.onerror = function (msg, url, line, col) {
  alert("ERROR:\n" + msg + "\nLínea: " + line + "\nCol: " + col);
};

/**********************
- FIREBASE
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

/**********************
- MAPA
**********************/
let map;
let markerUsuario;
let markersClientes = [];
let clientesMostrados = new Set();

map = L.map("map").setView([-32.4075, -63.2408], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/**********************
- OBTENER CLIENTES
**********************/
async function obtenerClientes() {
  const snap = await getDocs(collection(db, "clientes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**********************
- DIBUJAR CLIENTES EN MAPA
**********************/
async function dibujarClientes() {
  const clientes = await obtenerClientes();

  markersClientes.forEach(m => map.removeLayer(m));
  markersClientes = [];

  clientes.forEach(c => {
    if (!c.lat || !c.lng) return;
    const marker = L.marker([c.lat, c.lng])
      .addTo(map)
      .bindPopup(`<strong>${c.nombre}</strong>`);
    markersClientes.push(marker);
  });
}

/**********************
- DISTANCIA EN METROS
**********************/
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

/**********************
- VERIFICAR CERCANÍA (SIN TITILAR)
**********************/
async function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  const clientes = await obtenerClientes();
  let hayCercanos = false;

  clientes.forEach(c => {
    if (!c.lat || !c.lng || !c.radio) return;

    const d = distanciaMetros(lat, lng, c.lat, c.lng);

    if (d <= c.radio) {
      hayCercanos = true;

      if (clientesMostrados.has(c.id)) return;
      clientesMostrados.add(c.id);

      const card = document.createElement("div");
      card.className = "cliente-card";

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

  estado.textContent = hayCercanos
    ? "Clientes cercanos encontrados"
    : "No hay clientes cercanos";
}

/**********************
- REGISTRAR VISITA
**********************/
async function registrarVisita(cliente, lat, lng) {
  try {
    const tipo = prompt(
      "Tipo de visita:\n1 - Visita comercial\n2 - Ensayo\n3 - Entrega de productos"
    );

    let tipoVisita = "";
    let producto = "";
    let cantidad = "";

    if (tipo === "1") tipoVisita = "Visita comercial";
    else if (tipo === "2") tipoVisita = "Ensayo";
    else if (tipo === "3") {
      tipoVisita = "Entrega de productos";
      producto = prompt("Producto entregado:");
      cantidad = prompt("Cantidad:");
    } else {
      alert("❌ Tipo inválido");
      return;
    }

    await addDoc(collection(db, "visitas"), {
      clienteId: cliente.id,
      cliente: cliente.nombre,
      tipoVisita,
      producto,
      cantidad,
      lat,
      lng,
      fecha: serverTimestamp()
    });

    alert("✅ Visita registrada");
  } catch (e) {
    alert("❌ Error al guardar visita");
    console.error(e);
  }
}

/**********************
- GEOLOCALIZACIÓN
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
  () => alert("Error de geolocalización"),
  { enableHighAccuracy: true }
);

/**********************
- INICIO
**********************/
dibujarClientes();
