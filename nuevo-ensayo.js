
/**********************
 * FIREBASE
 **********************/
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    getDoc,
    updateDoc,
    doc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getBytes,
    refFromURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/**********************
 * CONFIG
 **********************/
const storage = getStorage();

/**********************
 * DOM
 **********************/
const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");

const fechaEl = document.getElementById("fecha");
const nombreEnsayoEl = document.getElementById("nombreEnsayo");
const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const elaboracionEl = document.getElementById("elaboracion");
const resultadosEl = document.getElementById("resultados");
const conclusionEl = document.getElementById("conclusion");
const propuestaComercialEl = document.getElementById("propuestaComercial");

const tituloFormulario = document.querySelector(".card-formulario h1");
const btnGuardar = form.querySelector(".btn-guardar");

const parametros = new URLSearchParams(window.location.search);
const ensayoId = parametros.get("id");
const modoEdicion = Boolean(ensayoId);

/**********************
 * IMÁGENES
 **********************/
const accionesForm = document.querySelector(".acciones-form");

accionesForm.insertAdjacentHTML("beforebegin", `
    <label for="inputFotos">Imágenes</label>

    <input
        type="file"
        id="inputFotos"
        accept="image/*"
        multiple
    />

    <div id="previewFotos" style="margin-top:12px;"></div>
`);

const fotosInput = document.getElementById("inputFotos");
const previewFotos = document.getElementById("previewFotos");

let fotosSeleccionadas = [];
let fotosExistentes = [];
let ensayoEdicionOriginal = null;

/**********************
 * MOSTRAR PREVISUALIZACIÓN
 **********************/
function obtenerReferenciaFoto(valor) {
    return typeof valor === "string" && /^(https?:|gs:)/i.test(valor)
        ? refFromURL(valor)
        : ref(storage, valor);
}

async function cargarBlobFoto(valor) {
    const referencia = obtenerReferenciaFoto(valor);
    const bytes = await getBytes(referencia, 50 * 1024 * 1024);
    return URL.createObjectURL(new Blob([bytes]));
}

async function mostrarPreviewFotos() {
    previewFotos.innerHTML = "";

    for (const valor of fotosExistentes) {
        const img = document.createElement("img");
        img.alt = "Imagen guardada del ensayo";
        img.style.maxWidth = "250px";
        img.style.marginRight = "10px";
        img.style.marginBottom = "12px";
        img.style.borderRadius = "10px";

        previewFotos.appendChild(img);
        try {
            img.src = await cargarBlobFoto(valor);
        } catch (error) {
            console.error("No se pudo cargar una foto guardada:", error);
            img.alt = "No se pudo cargar esta imagen";
        }
    }

    fotosSeleccionadas.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.alt = "Nueva imagen seleccionada";
        img.style.maxWidth = "250px";
        img.style.marginRight = "10px";
        img.style.marginBottom = "12px";
        img.style.borderRadius = "10px";

        previewFotos.appendChild(img);
    });
}

fotosInput.addEventListener("change", () => {
    fotosSeleccionadas = Array.from(fotosInput.files);
    mostrarPreviewFotos();
});

/**********************
 * SUBIR IMAGEN A STORAGE
 **********************/
async function subirImagen(file) {
    const nombre =
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2) +
        "_" +
        file.name;

    const referencia = ref(storage, "ensayos/" + nombre);

    await uploadBytes(referencia, file);

    // Guardamos la ruta, no una URL de descarga pública con token.
    return referencia.fullPath;
}

/**********************
 * CARGAR CLIENTES
 **********************/
async function cargarClientes() {
    const snap = await getDocs(collection(db, "clientes"));

    snap.forEach(docu => {
        const cliente = docu.data();

        const option = document.createElement("option");
        option.value = docu.id;
        option.textContent = cliente.nombre || "Cliente sin nombre";
        option.dataset.nombre = cliente.nombre || "";

        selectCliente.appendChild(option);
    });
}

/**********************
 * CARGAR ENSAYO PARA EDITAR
 **********************/
async function cargarEnsayoParaEditar() {
    if (!modoEdicion) return;

    tituloFormulario.textContent = "Editar ensayo";
    btnGuardar.textContent = "💾 Guardar cambios";
    document.title = "INLACT · Editar ensayo";

    const referencia = doc(db, "ensayos", ensayoId);
    const snap = await getDoc(referencia);

    if (!snap.exists()) {
        alert("No se encontró el ensayo que querés editar.");
        window.location.href = "ensayos.html";
        return;
    }

    const data = snap.data();
    ensayoEdicionOriginal = data;

    selectCliente.value = data.clienteId || "";
    nombreEnsayoEl.value = data.nombreEnsayo || "";

    if (data.fecha?.toDate) {
        const fecha = data.fecha.toDate();
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        fechaEl.value = `${anio}-${mes}-${dia}`;
    } else if (data.fecha) {
        const fecha = new Date(data.fecha);

        if (!Number.isNaN(fecha.getTime())) {
            const anio = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
            const dia = String(fecha.getDate()).padStart(2, "0");

            fechaEl.value = `${anio}-${mes}-${dia}`;
        }
    }

    propuestaEl.value = data.propuesta || "";
    dosisEl.value = data.dosis || "";
    elaboracionEl.value = data.elaboracion || "";
    resultadosEl.value = data.resultados || "";
    conclusionEl.value = data.conclusion || "";
    propuestaComercialEl.value = data.propuestaComercial || "";

    fotosExistentes = Array.isArray(data.fotos) ? [...data.fotos] : [];

    mostrarPreviewFotos();
}

/**********************
 * GUARDAR O ACTUALIZAR
 **********************/
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    const clienteOption =
        selectCliente.options[selectCliente.selectedIndex];

    if (!selectCliente.value || !clienteOption) {
        alert("Seleccioná un cliente para el ensayo.");
        return;
    }

    btnGuardar.disabled = true;

    try {
        /* Normalizar fotos antiguas a rutas privadas y agregar las nuevas */
        const fotos = fotosExistentes.map(valor =>
            obtenerReferenciaFoto(valor).fullPath
        );

        for (const file of fotosSeleccionadas) {
            const ruta = await subirImagen(file);
            fotos.push(ruta);
        }

        const datosEnsayo = {
            clienteId: selectCliente.value,
            clienteNombre: clienteOption.dataset.nombre ||
                clienteOption.textContent,

            nombreEnsayo: nombreEnsayoEl.value.trim(),

            fecha: Timestamp.fromDate(
                new Date(`${fechaEl.value}T12:00:00`)
            ),

            propuesta: propuestaEl.value || "",
            dosis: dosisEl.value || "",
            elaboracion: elaboracionEl.value || "",
            resultados: resultadosEl.value || "",
            conclusion: conclusionEl.value || "",
            propuestaComercial: propuestaComercialEl.value || "",
            fotos
        };

        if (modoEdicion) {
            const datosActualizacion = { ...datosEnsayo };
            const publicacionActiva = ensayoEdicionOriginal?.publicacionActiva === true;
            const tokenPublico = ensayoEdicionOriginal?.publicacionToken || null;
            const rutasCopiasPublicas = Array.isArray(ensayoEdicionOriginal?.publicacionFotosStoragePaths)
                ? ensayoEdicionOriginal.publicacionFotosStoragePaths
                : [];

            // Al editar un ensayo publicado, desactivar primero la copia pública
            // para evitar que el cliente siga viendo una versión desactualizada.
            if (publicacionActiva && tokenPublico) {
                await updateDoc(doc(db, "ensayos_publicos", tokenPublico), {
                    activo: false
                });
                datosActualizacion.publicacionActiva = false;
                // Conservamos las rutas hasta confirmar el borrado para no perder
                // la posibilidad de limpiar archivos públicos si algo falla.
            }

            await updateDoc(
                doc(db, "ensayos", ensayoId),
                datosActualizacion
            );

            // El enlace ya está desactivado; intentar eliminar las copias públicas.
            if (publicacionActiva && rutasCopiasPublicas.length) {
                const resultadosBorrado = await Promise.allSettled(
                    rutasCopiasPublicas.map(ruta => deleteObject(ref(storage, ruta)))
                );
                const erroresBorrado = resultadosBorrado.filter(resultado =>
                    resultado.status === "rejected" &&
                    resultado.reason?.code !== "storage/object-not-found"
                );
                if (erroresBorrado.length) {
                    // Las rutas quedan guardadas en Firestore para poder reintentar
                    // la limpieza al volver a publicar o desactivar el enlace.
                    console.error("El enlace se desactivó, pero algunas copias públicas no se pudieron borrar:", erroresBorrado);
                } else {
                    await updateDoc(
                        doc(db, "ensayos", ensayoId),
                        { publicacionFotosStoragePaths: [] }
                    );
                }
            }

            window.location.href = `ensayo.html?id=${encodeURIComponent(ensayoId)}`;
        } else {
            // Esperar a que Firebase confirme el usuario que inició sesión.
            // Así no se guarda un ensayo nuevo sin identificar a su creador.
            const usuarioActual = auth.currentUser || await new Promise((resolve) => {
                const cancelar = onAuthStateChanged(auth, (usuario) => {
                    cancelar();
                    resolve(usuario);
                });
            });

            if (!usuarioActual) {
                throw new Error("No se pudo identificar al usuario conectado. Cerrá sesión, volvé a ingresar e intentá guardar nuevamente.");
            }

            const perfilSnap = await getDoc(
                doc(db, "usuarios", usuarioActual.uid)
            );

            if (!perfilSnap.exists()) {
                throw new Error("No se encontró el perfil del usuario conectado. Contactá al administrador.");
            }

            const perfil = perfilSnap.data();
            const nombreCreador = (
                perfil.nombre ||
                perfil.nombreCompleto ||
                usuarioActual.displayName ||
                usuarioActual.email?.split("@")[0] ||
                ""
            ).trim();

            if (!nombreCreador) {
                throw new Error("El usuario conectado no tiene un nombre configurado en su perfil.");
            }

            const datosCreador = {
                creadoPor: nombreCreador,
                creadoPorUid: usuarioActual.uid
            };

            datosEnsayo.creadoEn = Timestamp.now();

            const docRef = await addDoc(
                collection(db, "ensayos"),
                {
                    ...datosEnsayo,
                    ...datosCreador
                }
            );

            window.location.href =
                `ensayo.html?id=${encodeURIComponent(docRef.id)}`;
        }

    } catch (error) {
        console.error("Error guardando el ensayo:", error);

        alert(
            "Error al guardar el ensayo.\n\n" +
            error.message
        );
    } finally {
        btnGuardar.disabled = false;
    }
});

/**********************
 * INIT
 **********************/
async function iniciar() {
    try {
        // Esperar a que Firebase restaure la sesión antes de leer datos o subir fotos.
        const usuarioActual = auth.currentUser || await new Promise((resolve) => {
            const cancelar = onAuthStateChanged(auth, (usuario) => {
                cancelar();
                resolve(usuario);
            });
        });

        if (!usuarioActual) {
            window.location.replace("login.html");
            return;
        }

        await cargarClientes();
        await cargarEnsayoParaEditar();
    } catch (error) {
        console.error("Error inicializando el formulario:", error);
        alert("No se pudieron cargar los datos. Intentá nuevamente.");
    }
}

iniciar();
