
/* ============================================================
   COTIZACIÓN INLACT
   Enlaces públicos mediante copias separadas y token aleatorio
============================================================ */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { db, auth } from "./firebase.js";


/* ============================================================
   ELEMENTOS
============================================================ */

const empresaEl = document.getElementById("empresa");
const fechaEl = document.getElementById("fecha");
const nombreCotizacionEl = document.getElementById("nombre-cotizacion");
const clienteEl = document.getElementById("cliente");
const propuestaEl = document.getElementById("contenido-propuesta");
const dosisEl = document.getElementById("contenido-dosis");
const listaProductosEl = document.getElementById("lista-productos-cotizacion");
const observacionesEl = document.getElementById("contenido-observaciones");
const totalEl = document.getElementById("total-cotizacion");


/* ============================================================
   URL Y ESTADO
============================================================ */

const parametros = new URLSearchParams(window.location.search);
const cotizacionId = parametros.get("id");
const tokenPublico = parametros.get("token");
const esPublico = Boolean(tokenPublico);

let cotizacionActual = null;
let tokenActual = null;
let usuarioInterno = false;


/* ============================================================
   AUTENTICACIÓN E INICIO
============================================================ */

onAuthStateChanged(auth, async (usuario) => {
  try {
    if (esPublico) {
      await cargarCotizacionPublica();
      configurarMenu();
      return;
    }

    if (!usuario) {
      window.location.replace("login.html");
      return;
    }

    usuarioInterno = true;

    await cargarCotizacionInterna();
    configurarMenu();
  } catch (error) {
    console.error("Error al cargar la cotización:", error);

    mostrarError(
      esPublico
        ? "Este enlace no está disponible o fue desactivado."
        : "No se pudo cargar la cotización. Verificá la conexión y los permisos."
    );
  }
});


/* ============================================================
   CARGAR COTIZACIÓN INTERNA
============================================================ */

async function cargarCotizacionInterna() {
  if (!cotizacionId) {
    mostrarError("No se indicó qué cotización abrir.");
    return;
  }

  const referencia = doc(db, "cotizaciones", cotizacionId);
  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    mostrarError("La cotización no existe o fue eliminada.");
    return;
  }

  cotizacionActual = {
    id: resultado.id,
    ...resultado.data()
  };

  tokenActual = cotizacionActual.publicacionToken || null;

  mostrarCotizacion(cotizacionActual);
  mostrarControlesPublicacion();
}


/* ============================================================
   CARGAR COPIA PÚBLICA
============================================================ */

async function cargarCotizacionPublica() {
  const referencia = doc(
    db,
    "cotizaciones_publicas",
    tokenPublico
  );

  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    mostrarError("Este enlace no está disponible.");
    return;
  }

  const datos = resultado.data();

  if (datos.activo !== true) {
    mostrarError("Este enlace fue desactivado por INLACT.");
    return;
  }

  mostrarCotizacion(datos);
}


/* ============================================================
   MOSTRAR COTIZACIÓN
============================================================ */

function mostrarCotizacion(cotizacion) {
  if (empresaEl) {
    empresaEl.textContent =
      cotizacion.clienteNombre || "Cliente sin nombre";
  }

  if (clienteEl) {
    clienteEl.textContent =
      cotizacion.clienteNombre || "Cliente sin nombre";
  }

  if (fechaEl) {
    fechaEl.textContent = formatearFecha(cotizacion.fecha);
  }

  if (nombreCotizacionEl) {
    nombreCotizacionEl.textContent =
      cotizacion.nombreCotizacion || "Cotización";
  }

  mostrarTexto(propuestaEl, cotizacion.propuesta);
  mostrarTexto(dosisEl, cotizacion.dosis);
  mostrarTexto(observacionesEl, cotizacion.observaciones);

  cargarProductos(cotizacion);

  document.body.style.visibility = "visible";
}


/* ============================================================
   FORMATEAR FECHA
============================================================ */

function formatearFecha(fecha) {
  if (!fecha) return "";

  let fechaReal = null;

  if (typeof fecha.toDate === "function") {
    fechaReal = fecha.toDate();
  } else if (fecha instanceof Date) {
    fechaReal = fecha;
  } else if (typeof fecha === "string") {
    fechaReal = new Date(fecha);
  }

  if (!fechaReal || Number.isNaN(fechaReal.getTime())) {
    return "";
  }

  return fechaReal.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}


/* ============================================================
   FORMATEAR PRECIO
============================================================ */

function formatearPrecio(precio, moneda) {
  const valor = Number(precio || 0);

  let simbolo = "$ ";

  if (moneda === "USD") {
    simbolo = "USD ";
  } else if (moneda === "EUR") {
    simbolo = "EUR ";
  }

  return simbolo + valor.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


/* ============================================================
   ESCAPAR HTML
============================================================ */

function escaparHTML(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ============================================================
   MOSTRAR TEXTO
============================================================ */

function mostrarTexto(elemento, texto) {
  if (!elemento) return;

  elemento.textContent = texto || "";
}


/* ============================================================
   PRODUCTOS
============================================================ */

function cargarProductos(cotizacion) {
  if (!listaProductosEl) return;

  listaProductosEl.replaceChildren();

  const productos = Array.isArray(cotizacion.productos)
    ? cotizacion.productos
    : [];

  if (productos.length === 0) {
    if (totalEl) totalEl.textContent = "";
    return;
  }

  const cabecera = document.createElement("div");
  cabecera.className = "cabecera-productos-cotizacion";

  cabecera.innerHTML = `
    <span>Producto</span>
    <span>Unidad</span>
    <span>Moneda</span>
    <span>Precio</span>
  `;

  listaProductosEl.appendChild(cabecera);

  productos.forEach((producto) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "producto-cotizacion";

    const nombre =
      producto.nombre ||
      producto.descripcion ||
      "Producto sin nombre";

    const unidad = producto.unidad || "-";
    const moneda = producto.moneda || "ARS";
    const precio = Number(producto.precioUnitario || 0);

    tarjeta.innerHTML = `
      <div class="producto-nombre">${escaparHTML(nombre)}</div>
      <div class="producto-unidad">${escaparHTML(unidad)}</div>
      <div class="producto-moneda">${escaparHTML(moneda)}</div>
      <div class="producto-precio">${formatearPrecio(precio, moneda)}</div>
    `;

    listaProductosEl.appendChild(tarjeta);
  });

  // No se calcula un total automáticamente porque los productos
  // actuales no muestran un campo de cantidad confirmado.
  if (totalEl) {
    totalEl.textContent = cotizacion.total
      ? "Total: " + formatearPrecio(
          cotizacion.total,
          cotizacion.monedaTotal || "ARS"
        )
      : "";
  }
}


/* ============================================================
   CONTROLES DE PUBLICACIÓN
============================================================ */

function mostrarControlesPublicacion() {
  if (!usuarioInterno || esPublico) return;

  const contenedor = document.querySelector(
    ".link-publico-cotizacion"
  );

  if (!contenedor) return;

  let panel = document.getElementById("controles-publicacion-cotizacion");

  if (panel) panel.remove();

  panel = document.createElement("div");
  panel.id = "controles-publicacion-cotizacion";
  panel.style.cssText =
    "margin-top:16px;padding:16px;background:#f1f7fb;border-radius:10px;";

  const titulo = document.createElement("h4");
  titulo.textContent = "Compartir cotización con el cliente";
  titulo.style.color = "#1f4e8c";

  const descripcion = document.createElement("p");
  descripcion.textContent =
    "El cliente podrá consultar una copia de esta cotización mediante el enlace.";

  const boton = document.createElement("button");
  boton.type = "button";
  boton.style.cssText =
    "padding:11px 16px;margin:8px 0;border:0;border-radius:8px;background:#168ac0;color:white;cursor:pointer;font-weight:600;";

  const enlace = document.createElement("input");
  enlace.type = "text";
  enlace.readOnly = true;
  enlace.style.cssText =
    "width:100%;padding:10px;box-sizing:border-box;margin-top:8px;";

  const botonCopiar = document.createElement("button");
  botonCopiar.type = "button";
  botonCopiar.textContent = "Copiar enlace";
  botonCopiar.style.cssText =
    "padding:10px 14px;margin-top:8px;border:0;border-radius:8px;background:#1f4e8c;color:white;cursor:pointer;";

  const estado = document.createElement("p");
  estado.style.cssText = "font-size:14px;margin-top:8px;";

  const estaActivo = cotizacionActual.publicacionActiva === true;

  boton.textContent = estaActivo
    ? "Desactivar enlace público"
    : tokenActual
      ? "Volver a activar enlace público"
      : "Crear enlace público";

  if (estaActivo && tokenActual) {
    enlace.value = crearUrlPublica(tokenActual);
    botonCopiar.hidden = false;
    enlace.hidden = false;
  } else {
    enlace.hidden = true;
    botonCopiar.hidden = true;
  }

  boton.addEventListener("click", async () => {
    boton.disabled = true;
    estado.textContent = "Procesando...";

    try {
      if (cotizacionActual.publicacionActiva === true) {
        await desactivarPublicacion();
        estado.textContent = "Enlace desactivado.";
      } else {
        await publicarCotizacion();
        estado.textContent = "Cotización publicada correctamente.";
      }

      mostrarControlesPublicacion();

      const nuevoEstado = document.getElementById(
        "controles-publicacion-cotizacion"
      );

      if (nuevoEstado) {
        const aviso = nuevoEstado.querySelector("p:last-child");
        if (aviso) aviso.textContent = estado.textContent;
      }
    } catch (error) {
      console.error("Error al publicar la cotización:", error);
      estado.textContent =
        "No se pudo completar la operación. Verificá la conexión y los permisos.";
      boton.disabled = false;
    }
  });

  botonCopiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(enlace.value);
      estado.textContent = "Enlace copiado.";
    } catch {
      enlace.focus();
      enlace.select();
      estado.textContent = "Seleccioná y copiá el enlace manualmente.";
    }
  });

  panel.append(
    titulo,
    descripcion,
    boton,
    enlace,
    botonCopiar,
    estado
  );

  contenedor.appendChild(panel);
}


/* ============================================================
   PUBLICAR COTIZACIÓN
============================================================ */

async function publicarCotizacion() {
  if (!cotizacionActual?.id) {
    throw new Error("No se identificó la cotización original.");
  }

  if (!tokenActual) {
    tokenActual = generarTokenAleatorio();
  }

  const copiaPublica = {
    clienteNombre: cotizacionActual.clienteNombre || "",
    nombreCotizacion: cotizacionActual.nombreCotizacion || "",
    fecha: cotizacionActual.fecha || null,
    propuesta: cotizacionActual.propuesta || "",
    dosis: cotizacionActual.dosis || "",
    productos: Array.isArray(cotizacionActual.productos)
      ? cotizacionActual.productos
      : [],
    observaciones: cotizacionActual.observaciones || "",
    total: cotizacionActual.total ?? null,
    monedaTotal: cotizacionActual.monedaTotal || "ARS",
    activo: true,
    actualizadoEn: serverTimestamp()
  };

  await setDoc(
    doc(db, "cotizaciones_publicas", tokenActual),
    copiaPublica
  );

  await updateDoc(
    doc(db, "cotizaciones", cotizacionActual.id),
    {
      publicacionToken: tokenActual,
      publicacionActiva: true
    }
  );

  cotizacionActual.publicacionToken = tokenActual;
  cotizacionActual.publicacionActiva = true;
}


/* ============================================================
   DESACTIVAR PUBLICACIÓN
============================================================ */

async function desactivarPublicacion() {
  if (!tokenActual) {
    throw new Error("No existe un enlace para desactivar.");
  }

  await updateDoc(
    doc(db, "cotizaciones_publicas", tokenActual),
    {
      activo: false,
      actualizadoEn: serverTimestamp()
    }
  );

  await updateDoc(
    doc(db, "cotizaciones", cotizacionActual.id),
    {
      publicacionActiva: false
    }
  );

  cotizacionActual.publicacionActiva = false;
}


/* ============================================================
   TOKEN Y URL PÚBLICA
============================================================ */

function generarTokenAleatorio() {
  const valores = new Uint8Array(32);
  crypto.getRandomValues(valores);

  return Array.from(valores)
    .map(valor => valor.toString(16).padStart(2, "0"))
    .join("");
}


function crearUrlPublica(token) {
  return `${window.location.origin}${window.location.pathname}?token=${encodeURIComponent(token)}`;
}


/* ============================================================
   MOSTRAR ERROR
============================================================ */

function mostrarError(mensaje) {
  document.body.style.visibility = "visible";

  const contenido = document.querySelector(
    ".contenido-blanco-cotizacion"
  );

  if (!contenido) {
    alert(mensaje);
    return;
  }

  contenido.replaceChildren();

  const aviso = document.createElement("p");
  aviso.textContent = mensaje;
  aviso.style.cssText =
    "padding:24px;color:#b42318;font-weight:600;";

  contenido.appendChild(aviso);
}


/* ============================================================
   MENÚ LATERAL
============================================================ */

function configurarMenu() {
  const botones = document.querySelectorAll(
    ".menu-cotizacion button"
  );

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const id = boton.dataset.seccion;
      const seccion = document.getElementById(id);

      if (!seccion) return;

      seccion.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      botones.forEach(b => b.classList.remove("activo"));
      boton.classList.add("activo");
    });
  });
}
