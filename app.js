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


/* ==========================================
   ÚLTIMAS 5 ACTIVIDADES
   Visitas, notas, ventas, ensayos y cotizaciones
========================================== */

function escaparHTMLActividad(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fechaActividad(datos) {
  const valor = datos?.creadoEn ?? datos?.fecha;

  if (!valor) return null;

  let fecha;

  if (typeof valor.toDate === "function") {
    fecha = valor.toDate();
  } else if (valor instanceof Date) {
    fecha = valor;
  } else {
    fecha = new Date(valor);
  }

  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function fechaActividadTexto(fecha) {
  if (!fecha) return "Fecha no disponible";

  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function empresaActividad(datos) {
  return datos?.clienteNombre || datos?.cliente || "Empresa sin nombre";
}

function abrirDetalleActividad(titulo, contenido) {
  const overlay = document.createElement("div");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:10000;
    padding:16px;
  `;

  const ventana = document.createElement("div");

  ventana.style.cssText = `
    background:#fff;
    padding:22px;
    border-radius:14px;
    width:100%;
    max-width:520px;
    max-height:85vh;
    overflow-y:auto;
    box-shadow:0 8px 30px rgba(0,0,0,.2);
  `;

  ventana.innerHTML = `
    <h3 style="color:#1f4e8c;margin-bottom:16px;">
      ${escaparHTMLActividad(titulo)}
    </h3>
    <div style="white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5;">
      ${contenido}
    </div>
    <button type="button" id="cerrarDetalleActividad"
      style="width:100%;padding:12px;margin-top:20px;
      border:0;border-radius:8px;background:#1f4e8c;
      color:white;font-size:16px;cursor:pointer;">
      Cerrar
    </button>
  `;

  overlay.appendChild(ventana);
  document.body.appendChild(overlay);

  ventana.querySelector("#cerrarDetalleActividad").onclick =
    () => overlay.remove();

  overlay.addEventListener("click", evento => {
    if (evento.target === overlay) overlay.remove();
  });
}

function mostrarDetalleVenta(actividad) {
  const productos = actividad.productos || [];

  const contenido = productos.length
    ? productos.map(producto => `
        <div style="padding:10px 0;border-bottom:1px solid #e1e7ee;">
          <strong>${escaparHTMLActividad(producto.nombre || "Producto")}</strong>
          <div>Cantidad: ${escaparHTMLActividad(producto.cantidad ?? "-")} ${escaparHTMLActividad(producto.unidad || "")}</div>
          ${producto.lote
            ? `<div>Lote: ${escaparHTMLActividad(producto.lote)}</div>`
            : ""}
        </div>
      `).join("")
    : "<p>No hay productos registrados en esta venta.</p>";

  abrirDetalleActividad(
    `Venta · ${actividad.empresa}`,
    contenido
  );
}

async function cargarUltimasActividades() {
  const lista = document.getElementById("listaVisitas");
  if (!lista) return;

  lista.innerHTML = `
    <li class="actividad-mensaje">Cargando actividades...</li>
  `;

  try {
    const [visitasSnap, egresosSnap, ensayosSnap, cotizacionesSnap] =
      await Promise.all([
        getDocs(collection(db, "visitas")),
        getDocs(collection(db, "egresos")),
        getDocs(collection(db, "ensayos")),
        getDocs(collection(db, "cotizaciones"))
      ]);

    const actividades = [];

    // VISITAS Y NOTAS
    visitasSnap.forEach(documento => {
      const datos = documento.data();
      const tipo = datos.tipoVisita || "";

      // Las ventas se toman de egresos, como en historial.html.
      if (tipo === "Venta" || tipo === "Entrega de productos") return;

      const esNota =
        tipo === "Nota" || tipo === "Nota de visita";

      const esVisita =
        tipo === "" || tipo === "Visita";

      if (!esNota && !esVisita) return;

      actividades.push({
        id: documento.id,
        categoria: esNota ? "📝 Nota" : "📍 Visita",
        titulo: datos.titulo || (esNota ? "Nota" : "Visita"),
        empresa: empresaActividad(datos),
        fecha: fechaActividad(datos),
        nota: datos.nota || "",
        tipoDetalle: esNota ? "nota" : "visita"
      });
    });

    // VENTAS: agrupar egresos del mismo cliente y día.
    const ventasAgrupadas = new Map();

    egresosSnap.forEach(documento => {
      const datos = documento.data();

      if (String(datos.tipoEgreso || "").toLowerCase() !== "venta") {
        return;
      }

      const fecha = fechaActividad(datos);
      const empresa = empresaActividad(datos);
      const dia = fecha
        ? `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`
        : "sin-fecha";

      const claveCliente = datos.clienteId || empresa;
      const clave = `${claveCliente}_${dia}`;

      if (!ventasAgrupadas.has(clave)) {
        ventasAgrupadas.set(clave, {
          id: documento.id,
          categoria: "💰 Venta",
          titulo: "",
          empresa,
          fecha,
          productos: [],
          tipoDetalle: "venta"
        });
      }

      const venta = ventasAgrupadas.get(clave);

      if (fecha && (!venta.fecha || fecha > venta.fecha)) {
        venta.fecha = fecha;
      }

      const producto = {
        nombre: datos.productoNombre || datos.nombreProducto ||
          datos.producto || datos.nombre || "Producto",
        cantidad: datos.cantidad ?? "-",
        unidad: datos.unidad || "",
        lote: datos.lote || ""
      };

      venta.productos.push(producto);
    });

    ventasAgrupadas.forEach(venta => {
      venta.titulo = `${venta.productos.length} ${
        venta.productos.length === 1 ? "producto" : "productos"
      }`;

      actividades.push(venta);
    });

    // ENSAYOS
    ensayosSnap.forEach(documento => {
      const datos = documento.data();

      actividades.push({
        id: documento.id,
        categoria: "🧪 Ensayo",
        titulo: datos.nombreEnsayo || "Ensayo",
        empresa: empresaActividad(datos),
        fecha: fechaActividad(datos),
        tipoDetalle: "ensayo"
      });
    });

    // COTIZACIONES
    cotizacionesSnap.forEach(documento => {
      const datos = documento.data();

      actividades.push({
        id: documento.id,
        categoria: "📄 Cotización",
        titulo: datos.nombreCotizacion || "Cotización",
        empresa: empresaActividad(datos),
        fecha: fechaActividad(datos),
        tipoDetalle: "cotizacion"
      });
    });

    // MÁS RECIENTES PRIMERO
    actividades.sort((a, b) =>
      (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0)
    );

    const ultimas = actividades.slice(0, 5);

    if (!ultimas.length) {
      lista.innerHTML = `
        <li class="actividad-mensaje">
          Todavía no hay actividades registradas.
        </li>
      `;
      return;
    }

    lista.innerHTML = ultimas.map(actividad => `
      <li class="actividad-historial"
          data-tipo="${escaparHTMLActividad(actividad.tipoDetalle)}"
          data-id="${escaparHTMLActividad(actividad.id)}">
        <div class="actividad-fecha">
          ${escaparHTMLActividad(fechaActividadTexto(actividad.fecha))}
        </div>
        <div class="actividad-empresa">
          ${escaparHTMLActividad(actividad.empresa)}
        </div>
        <div class="actividad-badge">
          ${escaparHTMLActividad(actividad.categoria)}
        </div>
        <div class="actividad-titulo">
          ${escaparHTMLActividad(actividad.titulo)}
        </div>
      </li>
    `).join("");

    // ACCIONES AL HACER CLIC EN CADA TARJETA
    lista.querySelectorAll(".actividad-historial").forEach((tarjeta, indice) => {
      tarjeta.addEventListener("click", () => {
        const actividad = ultimas[indice];

        if (actividad.tipoDetalle === "venta") {
          mostrarDetalleVenta(actividad);
          return;
        }

        if (actividad.tipoDetalle === "nota" ||
            actividad.tipoDetalle === "visita") {
          abrirDetalleActividad(
            `${actividad.categoria} · ${actividad.empresa}`,
            escaparHTMLActividad(actividad.nota || "No hay una nota adicional registrada.")
          );
          return;
        }

        if (actividad.tipoDetalle === "ensayo") {
          window.open(
            `ensayo.html?id=${encodeURIComponent(actividad.id)}`,
            "_blank"
          );
          return;
        }

        if (actividad.tipoDetalle === "cotizacion") {
          window.open(
            `cotizacion.html?id=${encodeURIComponent(actividad.id)}`,
            "_blank"
          );
        }
      });
    });

  } catch (error) {
    console.error("Error cargando últimas actividades:", error);

    lista.innerHTML = `
      <li class="actividad-mensaje">
        No se pudieron cargar las actividades. Revisá la conexión e intentá nuevamente.
      </li>
    `;
  }
}

// El enlace lleva al historial completo.
document.getElementById("abrir-historial")?.addEventListener("click", evento => {
  evento.preventDefault();
  window.location.href = "historial.html";
});

// Cargar las actividades al abrir el inicio.
cargarUltimasActividades();
