
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

/**********************
 * CONFIGURACIÓN
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");
const tokenPublico = params.get("token");

const esPublico = Boolean(tokenPublico);

let ensayoActual = null;
let tokenActual = null;
let usuarioInterno = false;

/**********************
 * INICIO
 **********************/
onAuthStateChanged(auth, async (usuario) => {
  try {
    if (esPublico) {
      await cargarEnsayoPublico();
      activarMenuSticky();
      activarScrollMenu();
      return;
    }

    if (!usuario) {
      window.location.replace("login.html");
      return;
    }

    usuarioInterno = true;

    await cargarEnsayoInterno();
    activarMenuSticky();
    activarScrollMenu();
  } catch (error) {
    console.error("Error al abrir el ensayo:", error);
    mostrarError(
      esPublico
        ? "Este enlace no está disponible o fue desactivado."
        : "No se pudo cargar el ensayo. Verificá tu conexión y permisos."
    );
  }
});

/**********************
 * CARGAR ENSAYO INTERNO
 **********************/
async function cargarEnsayoInterno() {
  if (!ensayoId) {
    mostrarError("No se indicó qué ensayo abrir.");
    return;
  }

  const referencia = doc(db, "ensayos", ensayoId);
  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    mostrarError("No se encontró el ensayo.");
    return;
  }

  ensayoActual = {
    id: resultado.id,
    ...resultado.data()
  };

  tokenActual = ensayoActual.publicacionToken || null;

  mostrarEnsayo(ensayoActual);
  mostrarControlesPublicacion();
}

/**********************
 * CARGAR COPIA PÚBLICA
 **********************/
async function cargarEnsayoPublico() {
  const referencia = doc(
    db,
    "ensayos_publicos",
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

  mostrarEnsayo(datos);
}

/**********************
 * MOSTRAR ENSAYO
 **********************/
function mostrarEnsayo(data) {
  document.getElementById("empresa").textContent =
    data.clienteNombre || "";

  document.getElementById("nombre-ensayo").textContent =
    data.nombreEnsayo || "";

  const fecha = data.fecha;

  document.getElementById("fecha").textContent =
    fecha && typeof fecha.toDate === "function"
      ? fecha.toDate().toLocaleDateString("es-AR")
      : "";

  renderBloque("propuesta", "Propuesta", data.propuesta);
  renderBloque("dosis", "Dosis", data.dosis);
  renderBloque("elaboracion", "Elaboración", data.elaboracion);
  renderBloque("resultados", "Resultados", data.resultados);
  renderBloque("conclusion", "Conclusión", data.conclusion);

  renderBloque(
    "propuestacomercial",
    "Propuesta comercial",
    data.propuestaComercial
  );

  renderImagenes(data.fotos || []);

  document.body.style.visibility = "visible";
}

/**********************
 * BLOQUES DE TEXTO
 **********************/
function renderBloque(id, titulo, contenido) {
  const contenedor = document.getElementById(id);
  if (!contenedor) return;

  contenedor.replaceChildren();

  const encabezado = document.createElement("h3");
  encabezado.textContent = titulo;
  encabezado.style.cssText =
    "color:#1f4e8c;margin-bottom:12px;font-weight:600;";

  const parrafo = document.createElement("p");
  parrafo.style.whiteSpace = "pre-line";
  parrafo.textContent = contenido || "—";

  contenedor.append(encabezado, parrafo);
}

/**********************
 * IMÁGENES Y PUBLICACIÓN
 **********************/
function renderImagenes(fotos) {
  const contenedor = document.getElementById("fotos");
  if (!contenedor) return;

  contenedor.replaceChildren();

  const encabezado = document.createElement("h3");
  encabezado.textContent = "Imágenes";
  encabezado.style.cssText =
    "color:#1f4e8c;margin-bottom:16px;font-weight:600;";

  contenedor.appendChild(encabezado);

  fotos.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Imagen del ensayo";
    img.style.cssText =
      "width:100%;max-width:480px;display:block;margin-bottom:16px;border-radius:12px;";

    contenedor.appendChild(img);
  });

  if (usuarioInterno && !esPublico) {
    mostrarControlesPublicacion();
  }
}

/**********************
 * CONTROLES DE PUBLICACIÓN
 **********************/
function mostrarControlesPublicacion() {
  if (!usuarioInterno || esPublico) return;

  const contenedor = document.getElementById("fotos");
  if (!contenedor) return;

  const anterior = document.getElementById("controles-publicacion");
  if (anterior) anterior.remove();

  const panel = document.createElement("div");
  panel.id = "controles-publicacion";
  panel.style.cssText =
    "margin-top:24px;padding:16px;background:#f1f7fb;border-radius:10px;";

  const titulo = document.createElement("h4");
  titulo.textContent = "Compartir ensayo con el cliente";
  titulo.style.color = "#1f4e8c";

  const descripcion = document.createElement("p");
  descripcion.textContent =
    "El cliente podrá consultar la copia publicada mediante este enlace.";

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

  const estaActivo = ensayoActual.publicacionActiva === true;

  boton.textContent = estaActivo
    ? "Desactivar enlace público"
    : tokenActual
      ? "Volver a activar enlace público"
      : "Crear enlace público";

  if (estaActivo && tokenActual) {
    enlace.value = crearUrlPublica(tokenActual);
    enlace.hidden = false;
    botonCopiar.hidden = false;
  } else {
    enlace.hidden = true;
    botonCopiar.hidden = true;
  }

  boton.addEventListener("click", async () => {
    boton.disabled = true;
    estado.textContent = "Procesando...";

    try {
      if (ensayoActual.publicacionActiva === true) {
        await desactivarPublicacion();
        estado.textContent = "Enlace desactivado.";
      } else {
        await publicarEnsayo();
        estado.textContent = "Ensayo publicado correctamente.";
      }

      mostrarControlesPublicacion();
    } catch (error) {
      console.error("Error en la publicación:", error);
      estado.textContent =
        "No se pudo completar la operación. Revisá la conexión y los permisos.";
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
      estado.textContent =
        "Seleccioná y copiá el enlace manualmente.";
    }
  });

  panel.append(titulo, descripcion, boton, enlace, botonCopiar, estado);
  contenedor.appendChild(panel);
}

/**********************
 * PUBLICAR COPIA
 **********************/
async function publicarEnsayo() {
  if (!ensayoActual?.id) {
    throw new Error("No se identificó el ensayo original.");
  }

  if (!tokenActual) {
    tokenActual = generarTokenAleatorio();
  }

  // Solo se copian los campos que verá el cliente.
  const copiaPublica = {
    clienteNombre: ensayoActual.clienteNombre || "",
    nombreEnsayo: ensayoActual.nombreEnsayo || "",
    fecha: ensayoActual.fecha || null,
    propuesta: ensayoActual.propuesta || "",
    dosis: ensayoActual.dosis || "",
    elaboracion: ensayoActual.elaboracion || "",
    resultados: ensayoActual.resultados || "",
    conclusion: ensayoActual.conclusion || "",
    propuestaComercial: ensayoActual.propuestaComercial || "",
    fotos: Array.isArray(ensayoActual.fotos)
      ? ensayoActual.fotos
      : [],
    activo: true,
    actualizadoEn: serverTimestamp()
  };

  await setDoc(
    doc(db, "ensayos_publicos", tokenActual),
    copiaPublica
  );

  await updateDoc(
    doc(db, "ensayos", ensayoActual.id),
    {
      publicacionToken: tokenActual,
      publicacionActiva: true
    }
  );

  ensayoActual.publicacionToken = tokenActual;
  ensayoActual.publicacionActiva = true;
}

/**********************
 * DESACTIVAR PUBLICACIÓN
 **********************/
async function desactivarPublicacion() {
  if (!tokenActual) {
    throw new Error("No hay una publicación para desactivar.");
  }

  await updateDoc(
    doc(db, "ensayos_publicos", tokenActual),
    {
      activo: false,
      actualizadoEn: serverTimestamp()
    }
  );

  await updateDoc(
    doc(db, "ensayos", ensayoActual.id),
    {
      publicacionActiva: false
    }
  );

  ensayoActual.publicacionActiva = false;
}

/**********************
 * GENERAR CÓDIGO ALEATORIO
 **********************/
function generarTokenAleatorio() {
  const valores = new Uint8Array(32);
  crypto.getRandomValues(valores);

  return Array.from(valores)
    .map(valor => valor.toString(16).padStart(2, "0"))
    .join("");
}

/**********************
 * URL PÚBLICA
 **********************/
function crearUrlPublica(token) {
  return `${window.location.origin}${window.location.pathname}?token=${encodeURIComponent(token)}`;
}

/**********************
 * MOSTRAR ERRORES
 **********************/
function mostrarError(mensaje) {
  document.body.style.visibility = "visible";

  const contenido = document.querySelector(".contenido-blanco");
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

/**********************
 * MENÚ LATERAL
 **********************/
function activarMenuSticky() {
  const menu = document.querySelector(".menu-ensayo");
  if (menu) {
    menu.style.position = "sticky";
    menu.style.top = "20px";
  }
}

function activarScrollMenu() {
  document.querySelectorAll(".menu-ensayo button").forEach(btn => {
    btn.addEventListener("click", () => {
      const destino = document.getElementById(btn.dataset.seccion);
      if (!destino) return;

      destino.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}
