
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

import {
  getStorage,
  ref,
  getBytes,
  getDownloadURL,
  getMetadata,
  uploadBytes,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const storage = getStorage();

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
let puedeGestionarPublicacion = false;

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

  const usuarioActual = auth.currentUser;
  if (usuarioActual) {
    const perfilSnap = await getDoc(doc(db, "usuarios", usuarioActual.uid));
    const perfil = perfilSnap.exists() ? perfilSnap.data() : {};
    puedeGestionarPublicacion =
      perfil.rol === "admin" || ensayoActual.creadoPorUid === usuarioActual.uid;
  }

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
async function mostrarEnsayo(data) {
  document.getElementById("empresa").textContent =
    data.clienteNombre || "";

  document.getElementById("nombre-ensayo").textContent =
    data.nombreEnsayo || "";

  const nombreUsuarioEl = document.getElementById("nombreUsuario");
  if (nombreUsuarioEl) {
    let nombreCreador = data.creadoPor;

    // Este ensayo fue creado por Usuario Prueba antes de guardar
    // los datos del creador en los nuevos registros.
    if (!nombreCreador && ensayoId === "qOARW6kb4hOAnGc6Dtdz") {
      nombreCreador = "Usuario Prueba";
    }

    // Si existe el UID, recuperar el nombre desde el perfil de usuario
    // cuando creadoPor esté vacío o tenga el valor genérico.
    if ((!nombreCreador || nombreCreador === "Usuario") && data.creadoPorUid) {
      try {
        const perfilSnap = await getDoc(doc(db, "usuarios", data.creadoPorUid));
        if (perfilSnap.exists()) {
          const perfil = perfilSnap.data();
          nombreCreador =
            perfil.nombre ||
            perfil.nombreCompleto ||
            nombreCreador;
        }
      } catch (error) {
        console.error("No se pudo recuperar el nombre del creador:", error);
      }
    }

    nombreUsuarioEl.textContent =
      (nombreCreador && nombreCreador !== "Usuario")
        ? nombreCreador.toLocaleUpperCase("es-AR")
        : "INLACT";
  }

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

  await renderImagenes(data.fotos || []);

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
function obtenerReferenciaFoto(valor) {
  return typeof valor === "string" && /^(https?:|gs:)/i.test(valor)
    ? ref(storage, valor)
    : ref(storage, valor);
}

async function renderImagenes(fotos) {
  const contenedor = document.getElementById("fotos");
  if (!contenedor) return;

  contenedor.replaceChildren();

  const encabezado = document.createElement("h3");
  encabezado.textContent = "Imágenes";
  encabezado.style.cssText =
    "color:#1f4e8c;margin-bottom:16px;font-weight:600;";

  contenedor.appendChild(encabezado);

  for (const valor of fotos) {
    const img = document.createElement("img");
    img.alt = "Imagen del ensayo";
    img.style.cssText =
      "width:100%;max-width:480px;display:block;margin-bottom:16px;border-radius:12px;";

    contenedor.appendChild(img);

    try {
      if (esPublico) {
        // Las publicaciones usan URL con token de sus copias públicas.
        img.src = valor;
      } else {
        // Obtener la URL de descarga de Storage y dejar que el navegador cargue la imagen.
        // Esto evita descargar el archivo completo como Blob desde JavaScript.
        const referencia = obtenerReferenciaFoto(valor);
        img.src = await getDownloadURL(referencia);
      }
    } catch (error) {
      console.error("No se pudo cargar una imagen del ensayo:", error);
      img.alt = "No se pudo cargar esta imagen";
      const aviso = document.createElement("p");
      aviso.textContent = "No se pudo cargar la imagen. " +
        (error?.code ? "Código: " + error.code : "Revisá la conexión y los permisos de Storage.");
      aviso.style.cssText = "color:#b42318;font-size:14px;margin:0 0 16px;";
      contenedor.appendChild(aviso);
    }
  }

  if (usuarioInterno && !esPublico) {
    mostrarControlesPublicacion();
  }
}

/**********************
 * CONTROLES DE PUBLICACIÓN
 **********************/
function mostrarControlesPublicacion() {
  if (!usuarioInterno || esPublico || !puedeGestionarPublicacion) return;

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
        await publicarEnsayo((mensaje) => {
          estado.textContent = mensaje;
        });
        estado.textContent = "Ensayo publicado correctamente.";
      }

      mostrarControlesPublicacion();
    } catch (error) {
      console.error("Error en la publicación:", error);
      const detalle = error?.code || error?.message || "Error sin detalle";
      estado.textContent =
        "No se pudo completar: " + detalle;
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
async function crearCopiasPublicas(fotos, token, informarProgreso = () => {}) {
  const urls = [];
  const paths = [];

  try {
    for (let i = 0; i < fotos.length; i++) {
      const numeroImagen = i + 1;
      informarProgreso(`Imagen ${numeroImagen} de ${fotos.length}: leyendo el archivo original...`);
      const urlOriginal = fotos[i];
      const referenciaOriginal =
        typeof urlOriginal === "string" && /^(https?:|gs:)/i.test(urlOriginal)
          ? ref(storage, urlOriginal)
          : ref(storage, urlOriginal);
      // Evita que la publicación quede indefinidamente en "leyendo".
      // El límite de tiempo solo diagnostica la demora; no modifica permisos ni reglas.
      let temporizadorLectura;
      let bytes;
      try {
        bytes = await Promise.race([
          getBytes(referenciaOriginal, 50 * 1024 * 1024),
          new Promise((_, reject) => {
            temporizadorLectura = setTimeout(() => {
              const error = new Error(
                "La lectura de la imagen superó los 20 segundos. La imagen puede verse en pantalla, pero Firebase no está completando su lectura para copiarla. No se modificaron las reglas ni se publicó el archivo original."
              );
              error.code = "inlact/lectura-tiempo-agotado";
              reject(error);
            }, 20000);
          })
        ]);
      } finally {
        clearTimeout(temporizadorLectura);
      }
      informarProgreso(`Imagen ${numeroImagen}: archivo leído; consultando sus datos...`);
      const metadataOriginal = await getMetadata(referenciaOriginal);

      const nombreBase = (referenciaOriginal.name || "imagen")
        .replace(/[^a-zA-Z0-9._-]/g, "_");
      const sufijo = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
      const nombrePublico = `${String(i + 1).padStart(2, "0")}_${Date.now()}_${sufijo}_${nombreBase}`;
      const referenciaPublica = ref(
        storage,
        `ensayos_publicos/${token}/${nombrePublico}`
      );

      informarProgreso(`Imagen ${numeroImagen}: subiendo la copia pública...`);
      await uploadBytes(referenciaPublica, bytes, {
        contentType: metadataOriginal.contentType || "application/octet-stream"
      });

      paths.push(referenciaPublica.fullPath);
      informarProgreso(`Imagen ${numeroImagen}: obteniendo el enlace de la copia...`);
      urls.push(await getDownloadURL(referenciaPublica));
      informarProgreso(`Imagen ${numeroImagen}: copia lista.`);
    }

    return { urls, paths };
  } catch (error) {
    await Promise.allSettled(
      paths.map(path => deleteObject(ref(storage, path)))
    );
    throw error;
  }
}

async function eliminarCopiasPublicas(paths) {
  const resultados = await Promise.allSettled(
    paths.map(path => deleteObject(ref(storage, path)))
  );

  const fallosReales = resultados.filter(
    resultado => resultado.status === "rejected" &&
      resultado.reason?.code !== "storage/object-not-found"
  );
  if (fallosReales.length) throw fallosReales[0].reason;
}

async function publicarEnsayo(informarProgreso = () => {}) {
  if (!puedeGestionarPublicacion) {
    throw new Error("Solo quien creó el ensayo o el administrador puede gestionar su enlace.");
  }

  if (!ensayoActual?.id) {
    throw new Error("No se identificó el ensayo original.");
  }

  if (!tokenActual) {
    tokenActual = generarTokenAleatorio();
  }

  const fotosOriginales = Array.isArray(ensayoActual.fotos)
    ? ensayoActual.fotos
    : [];
  const rutasPublicasAnteriores = Array.isArray(ensayoActual.publicacionFotosStoragePaths)
    ? ensayoActual.publicacionFotosStoragePaths
    : [];
  informarProgreso(
    fotosOriginales.length
      ? `Preparando ${fotosOriginales.length} imagen(es) para el enlace público...`
      : "Guardando la copia pública del ensayo..."
  );
  const copias = await crearCopiasPublicas(fotosOriginales, tokenActual, informarProgreso);
  // Mientras se reemplazan las fotos, conservamos registradas las rutas anteriores
  // para poder reintentar su limpieza si algún borrado falla.
  const rutasPublicasRegistradas = [
    ...new Set([...rutasPublicasAnteriores, ...copias.paths])
  ];

  // La publicación contiene URL de copias separadas, nunca las URL originales.
  const copiaPublica = {
    registroId: ensayoActual.id,
    clienteNombre: ensayoActual.clienteNombre || "",
    creadoPor: ensayoActual.creadoPor || "",
    nombreEnsayo: ensayoActual.nombreEnsayo || "",
    fecha: ensayoActual.fecha || null,
    propuesta: ensayoActual.propuesta || "",
    dosis: ensayoActual.dosis || "",
    elaboracion: ensayoActual.elaboracion || "",
    resultados: ensayoActual.resultados || "",
    conclusion: ensayoActual.conclusion || "",
    propuestaComercial: ensayoActual.propuestaComercial || "",
    fotos: copias.urls,
    activo: true,
    actualizadoEn: serverTimestamp()
  };

  try {
    informarProgreso("Guardando la copia pública en la base de datos...");
    await setDoc(
      doc(db, "ensayos_publicos", tokenActual),
      copiaPublica
    );

    informarProgreso("Activando el enlace público...");
    await updateDoc(
      doc(db, "ensayos", ensayoActual.id),
      {
        publicacionToken: tokenActual,
        publicacionActiva: true,
        publicacionFotosStoragePaths: rutasPublicasRegistradas
      }
    );
  } catch (error) {
    // Si falla el guardado, dejar inaccesible la copia pública y limpiar archivos nuevos.
    await updateDoc(doc(db, "ensayos_publicos", tokenActual), {
      activo: false,
      actualizadoEn: serverTimestamp()
    }).catch(() => {});
    await Promise.allSettled(
      copias.paths.map(path => deleteObject(ref(storage, path)))
    );
    throw error;
  }

  ensayoActual.publicacionToken = tokenActual;
  ensayoActual.publicacionActiva = true;
  ensayoActual.publicacionFotosStoragePaths = rutasPublicasRegistradas;

  // La nueva publicación ya está activa. Ahora limpiamos las fotos de la versión
  // anterior; si falla algún borrado, dejamos sus rutas registradas para poder
  // volver a intentarlo al desactivar el enlace.
  if (rutasPublicasAnteriores.length) {
    try {
      await eliminarCopiasPublicas(rutasPublicasAnteriores);
      await updateDoc(
        doc(db, "ensayos", ensayoActual.id),
        { publicacionFotosStoragePaths: copias.paths }
      );
      ensayoActual.publicacionFotosStoragePaths = copias.paths;
    } catch (error) {
      console.warn(
        "La publicación se actualizó, pero no se pudieron limpiar todas las fotos anteriores. Sus rutas quedaron registradas para una limpieza posterior.",
        error
      );
    }
  }
}

/**********************
 * DESACTIVAR PUBLICACIÓN
 **********************/
async function desactivarPublicacion() {
  if (!puedeGestionarPublicacion) {
    throw new Error("Solo quien creó el ensayo o el administrador puede gestionar su enlace.");
  }

  if (!tokenActual) {
    throw new Error("No hay una publicación para desactivar.");
  }

  // Primero desactivar el enlace; después borrar las imágenes asociadas a esa copia.
  await updateDoc(
    doc(db, "ensayos_publicos", tokenActual),
    {
      activo: false,
      actualizadoEn: serverTimestamp()
    }
  );

  let errorActualizacionOriginal = null;

  try {
    await updateDoc(
      doc(db, "ensayos", ensayoActual.id),
      { publicacionActiva: false }
    );
  } catch (error) {
    errorActualizacionOriginal = error;
  }

  // Aunque falle la actualización del registro original, el enlace público ya
  // está desactivado: intentamos borrar igualmente las copias publicadas.
  ensayoActual.publicacionActiva = false;

  const paths = Array.isArray(ensayoActual.publicacionFotosStoragePaths)
    ? ensayoActual.publicacionFotosStoragePaths
    : [];

  await eliminarCopiasPublicas(paths);

  await updateDoc(
    doc(db, "ensayos", ensayoActual.id),
    { publicacionFotosStoragePaths: [] }
  );

  ensayoActual.publicacionFotosStoragePaths = [];

  if (errorActualizacionOriginal) throw errorActualizacionOriginal;
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
