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
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwhmUOAeLZdv4",
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
- DIBUJAR CLIENTES
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
- DISTANCIA
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

  return R * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
}

/**********************
- CÓMO LLEGAR
**********************/
function comoLlegar(cliente, lat, lng) {

  if (!cliente.lat || !cliente.lng) {
    alert("Este cliente no tiene una ubicación registrada.");
    return;
  }

  const origen = `${lat},${lng}`;
  const destino = `${cliente.lat},${cliente.lng}`;

  const url =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${encodeURIComponent(origen)}` +
    `&destination=${encodeURIComponent(destino)}` +
    `&travelmode=driving`;

  window.open(url, "_blank");
}

/**********************
- VERIFICAR CERCANÍA
**********************/
async function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  const clientes = await obtenerClientes();
  let hayCercanos = false;

  clientes.forEach(c => {

    if (!c.lat || !c.lng || !c.radio) return;

    if (distanciaMetros(lat, lng, c.lat, c.lng) <= c.radio) {

      hayCercanos = true;

      if (clientesMostrados.has(c.id)) return;

      clientesMostrados.add(c.id);

      const card = document.createElement("div");
      card.className = "cliente-card";

      const nombre = document.createElement("span");
      nombre.className = "cliente-nombre";
      nombre.textContent = c.nombre;

      /**********************
      - BOTÓN REGISTRAR VISITA
      **********************/
      const btnVisita = document.createElement("button");
      btnVisita.textContent = "Registrar visita";

      btnVisita.onclick = () => registrarVisita(c, lat, lng);

      /**********************
      - BOTÓN CÓMO LLEGAR
      **********************/
      const btnLlegar = document.createElement("button");
      btnLlegar.textContent = "Cómo llegar";

      btnLlegar.onclick = () => comoLlegar(c, lat, lng);

      /**********************
      - CONTENEDOR BOTONES
      **********************/
      const botones = document.createElement("div");

      botones.style.cssText = `
        display:flex;
        gap:10px;
        flex-wrap:wrap;
      `;

      botones.append(btnVisita, btnLlegar);

      card.append(nombre, botones);
      acciones.appendChild(card);
    }
  });

  estado.textContent = hayCercanos
    ? "Clientes cercanos encontrados"
    : "No hay clientes cercanos";
}

/**********************
- FORMULARIO ENTREGA
- SE MANTIENE
**********************/
function mostrarFormularioEntrega(cliente, lat, lng) {
  const overlay = document.createElement("div");

  overlay.style.cssText = `
    position:fixed; inset:0;
    background:rgba(0,0,0,.6);
    display:flex; align-items:center; justify-content:center;
    z-index:9999;
  `;

  const box = document.createElement("div");

  box.style.cssText = `
    background:#fff;
    padding:24px;
    border-radius:16px;
    width:92%;
    max-width:460px;
    font-size:18px;
  `;

  box.innerHTML = `
    <h3 style="margin-bottom:14px;">Entrega de productos</h3>
    <div id="productos"></div>

    <button id="agregarProducto" style="width:100%;padding:14px;margin-top:10px;">
      ➕ Agregar producto
    </button>

    <button id="guardarEntrega" style="width:100%;padding:16px;margin-top:16px;font-weight:bold;">
      Registrar visita
    </button>

    <button id="cancelarEntrega" style="width:100%;padding:14px;margin-top:10px;">
      Cancelar
    </button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const contenedor = box.querySelector("#productos");

  function agregarFila() {
    const fila = document.createElement("div");

    fila.style.cssText = `
      display:flex;
      gap:8px;
      margin-bottom:10px;
    `;

    fila.innerHTML = `
      <input placeholder="Producto" style="flex:2;padding:12px;font-size:16px;">
      <input placeholder="Cantidad" style="flex:1;padding:12px;font-size:16px;">
      <button style="padding:12px;">✖</button>
    `;

    fila.querySelector("button").onclick = () => fila.remove();

    contenedor.appendChild(fila);
  }

  agregarFila();

  box.querySelector("#agregarProducto").onclick = agregarFila;

  box.querySelector("#cancelarEntrega").onclick = () => overlay.remove();

  box.querySelector("#guardarEntrega").onclick = async () => {

    const productos = [];

    contenedor.querySelectorAll("div").forEach(f => {

      const [p, c] = f.querySelectorAll("input");

      if (p.value.trim()) {
        productos.push({
          nombre: p.value.trim(),
          cantidad: c.value.trim()
        });
      }
    });

    if (!productos.length) {
      return alert("Agregá al menos un producto");
    }

    await addDoc(collection(db, "visitas"), {
      clienteId: cliente.id,
      cliente: cliente.nombre,
      tipoVisita: "Entrega de productos",
      productos,
      lat,
      lng,
      fecha: serverTimestamp()
    });

    alert("✅ Entrega registrada");

    overlay.remove();
  };
}

/**********************
- FORMULARIO NOTA DE VISITA
**********************/
function mostrarFormularioNota(cliente, lat, lng) {

  const overlay = document.createElement("div");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:9999;
    padding:15px;
  `;

  const box = document.createElement("div");

  box.style.cssText = `
    background:#fff;
    padding:24px;
    border-radius:16px;
    width:92%;
    max-width:520px;
    max-height:90vh;
    overflow-y:auto;
    font-size:17px;
  `;

  const ahora = new Date();

  const fecha = ahora.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const hora = ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  box.innerHTML = `
    <h3 style="margin-bottom:18px;">
      Registrar visita
    </h3>

    <div style="margin-bottom:14px;">
      <label style="
        display:block;
        font-weight:600;
        margin-bottom:5px;
      ">
        Cliente
      </label>

      <input
        type="text"
        value="${cliente.nombre}"
        readonly
        style="
          width:100%;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
          background:#f3f3f3;
          font-size:16px;
        "
      >
    </div>

    <div style="
      display:flex;
      gap:12px;
      margin-bottom:14px;
    ">

      <div style="flex:1;">

        <label style="
          display:block;
          font-weight:600;
          margin-bottom:5px;
        ">
          Fecha
        </label>

        <input
          type="text"
          value="${fecha}"
          readonly
          style="
            width:100%;
            padding:12px;
            border:1px solid #ddd;
            border-radius:8px;
            background:#f3f3f3;
            font-size:16px;
          "
        >

      </div>

      <div style="flex:1;">

        <label style="
          display:block;
          font-weight:600;
          margin-bottom:5px;
        ">
          Hora
        </label>

        <input
          type="text"
          value="${hora}"
          readonly
          style="
            width:100%;
            padding:12px;
            border:1px solid #ddd;
            border-radius:8px;
            background:#f3f3f3;
            font-size:16px;
          "
        >

      </div>

    </div>

    <div style="margin-bottom:14px;">

      <label style="
        display:block;
        font-weight:600;
        margin-bottom:5px;
      ">
        Título
      </label>

      <input
        id="tituloNota"
        type="text"
        placeholder="Ej.: Reunión con producción"
        style="
          width:100%;
          padding:13px;
          border:1px solid #ccc;
          border-radius:8px;
          font-size:16px;
        "
      >

    </div>

    <div style="margin-bottom:18px;">

      <label style="
        display:block;
        font-weight:600;
        margin-bottom:5px;
      ">
        Nota
      </label>

      <textarea
        id="contenidoNota"
        rows="9"
        placeholder="Escribí todo lo hablado, realizado o acordado durante la visita..."
        style="
          width:100%;
          padding:13px;
          border:1px solid #ccc;
          border-radius:8px;
          font-size:16px;
          resize:vertical;
          font-family:inherit;
          line-height:1.4;
        "
      ></textarea>

    </div>

    <button
      id="guardarNota"
      style="
        width:100%;
        padding:15px;
        background:linear-gradient(135deg,#1f4e8c,#3b82f6);
        color:#fff;
        border:none;
        border-radius:8px;
        font-size:17px;
        font-weight:bold;
        cursor:pointer;
      "
    >
      Guardar visita
    </button>

    <button
      id="cancelarNota"
      style="
        width:100%;
        padding:13px;
        margin-top:10px;
        background:#eee;
        color:#333;
        border:none;
        border-radius:8px;
        font-size:16px;
        cursor:pointer;
      "
    >
      Cancelar
    </button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  /**********************
  - CANCELAR
  **********************/
  box.querySelector("#cancelarNota").onclick = () => {
    overlay.remove();
  };

  /**********************
  - GUARDAR
  **********************/
  box.querySelector("#guardarNota").onclick = async () => {

    const titulo =
      box.querySelector("#tituloNota").value.trim();

    const contenido =
      box.querySelector("#contenidoNota").value.trim();

    if (!titulo) {
      alert("Escribí un título para la visita.");
      box.querySelector("#tituloNota").focus();
      return;
    }

    if (!contenido) {
      alert("Escribí una nota sobre la visita.");
      box.querySelector("#contenidoNota").focus();
      return;
    }

    const botonGuardar =
      box.querySelector("#guardarNota");

    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando...";

    try {

      await addDoc(collection(db, "visitas"), {

        clienteId: cliente.id,

        cliente: cliente.nombre,

        tipoVisita: "Nota de visita",

        titulo: titulo,

        nota: contenido,

        lat: lat ?? null,

        lng: lng ?? null,

        fecha: serverTimestamp()
      });

      alert("✅ Visita registrada");

      overlay.remove();

    } catch (error) {

      console.error(
        "Error guardando visita:",
        error
      );

      alert(
        "No se pudo guardar la visita."
      );

      botonGuardar.disabled = false;
      botonGuardar.textContent =
        "Guardar visita";
    }
  };

  setTimeout(() => {
    box.querySelector("#tituloNota").focus();
  }, 100);
}

/**********************
- REGISTRAR VISITA
**********************/
async function registrarVisita(cliente, lat, lng) {

  mostrarFormularioNota(
    cliente,
    lat,
    lng
  );
}

/**********************
- GEOLOCALIZACIÓN
**********************/
navigator.geolocation.watchPosition(
  pos => {

    const {
      latitude: lat,
      longitude: lng
    } = pos.coords;

    if (!markerUsuario) {

      markerUsuario =
        L.marker([lat, lng])
          .addTo(map);

      map.setView(
        [lat, lng],
        15
      );

    } else {

      markerUsuario.setLatLng([
        lat,
        lng
      ]);
    }

    verificarProximidad(
      lat,
      lng
    );
  },

  () => alert(
    "Error de geolocalización"
  ),

  {
    enableHighAccuracy: true
  }
);

/**********************
- INICIO
**********************/
dibujarClientes();
