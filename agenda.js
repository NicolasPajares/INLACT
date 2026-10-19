import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";
import { obtenerPerfilUsuario } from "./proteger.js";

const perfil = obtenerPerfilUsuario();
const esAdmin = perfil?.rol === "admin";

const formPanel = document.getElementById("panelFormulario");
const form = document.getElementById("formActividad");
const lista = document.getElementById("listaActividades");
const estadoCarga = document.getElementById("estadoCargaAgenda");
const btnNueva = document.getElementById("btnNuevaActividad");
const btnCancelar = document.getElementById("btnCancelarFormulario");
const btnGuardar = document.getElementById("btnGuardarActividad");
const mensajeFormulario = document.getElementById("mensajeFormulario");
const filtroResponsable = document.getElementById("filtroResponsable");
const filtroResponsableContenedor = document.getElementById("filtroAdminContenedor");

let actividades = [];
let filtroActual = "todas";
let responsables = [];

const coleccionAgenda = collection(db, "agenda_actividades");
const campo = (id) => document.getElementById(id);

if (esAdmin) {
    campo("tituloAgenda").textContent = "Agenda del equipo";
    campo("subtituloAgenda").textContent = "Supervisá las actividades y el avance de cada integrante.";
    campo("tituloListado").textContent = "Actividades del equipo";
    campo("textoListado").textContent = "Como administrador podés consultar todas las agendas; cada integrante gestiona sus propias tareas.";
    filtroResponsableContenedor.hidden = false;
    cargarResponsables();
} else {
    campo("tituloAgenda").textContent = "Mi agenda";
    campo("subtituloAgenda").textContent = "Organizá tus tareas, fechas y prioridades.";
}

btnNueva.addEventListener("click", () => {
    limpiarFormulario();
    formPanel.hidden = false;
    campo("tituloFormulario").textContent = "Nueva actividad";
    campo("fechaActividad").value = fechaLocalHoy();
    formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    campo("tituloActividad").focus();
});

btnCancelar.addEventListener("click", cerrarFormulario);

document.querySelectorAll(".agenda-filter").forEach((boton) => {
    boton.addEventListener("click", () => {
        filtroActual = boton.dataset.filtro;
        document.querySelectorAll(".agenda-filter").forEach((b) => b.classList.toggle("active", b === boton));
        renderizarActividades();
    });
});

filtroResponsable.addEventListener("change", renderizarActividades);

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!perfil?.uid) return;

    const id = campo("actividadId").value;
    const titulo = campo("tituloActividad").value.trim();
    const fecha = campo("fechaActividad").value;
    if (!titulo || !fecha) {
        mensajeFormulario.textContent = "Completá el título y la fecha.";
        return;
    }

    const estado = campo("estadoActividad").value;
    const ahora = {
        titulo,
        descripcion: campo("descripcionActividad").value.trim(),
        fecha,
        prioridad: campo("prioridadActividad").value,
        estado,
        responsableUid: id ? (actividades.find(a => a.id === id)?.responsableUid || perfil.uid) : perfil.uid,
        responsableNombre: id ? (actividades.find(a => a.id === id)?.responsableNombre || perfil.nombre || "Usuario") : (perfil.nombre || "Usuario"),
        actualizadoEn: serverTimestamp(),
        completadoEn: estado === "realizada" ? serverTimestamp() : null
    };

    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando…";
    mensajeFormulario.textContent = "";

    try {
        if (id) {
            const actividad = actividades.find(a => a.id === id);
            if (!actividad || actividad.responsableUid !== perfil.uid) {
                throw new Error("Solo podés modificar actividades de tu propia agenda.");
            }
            await updateDoc(doc(db, "agenda_actividades", id), ahora);
        } else {
            await addDoc(coleccionAgenda, {
                ...ahora,
                creadoPorUid: perfil.uid,
                creadoEn: serverTimestamp()
            });
        }

        cerrarFormulario();
        await cargarActividades();
    } catch (error) {
        console.error("Error guardando actividad de agenda:", error);
        mensajeFormulario.textContent = error.code === "permission-denied"
            ? "Firestore todavía no autoriza esta colección. La regla específica debe revisarse antes de habilitar la agenda."
            : (error.message || "No se pudo guardar la actividad.");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar actividad";
    }
});

async function cargarResponsables() {
    if (!esAdmin) return;
    try {
        const snap = await getDocs(collection(db, "usuarios"));
        responsables = snap.docs.map(d => ({
            uid: d.id,
            nombre: (d.data().nombre || d.data().nombreCompleto || d.data().email || d.id).trim(),
            rol: d.data().rol || ""
        })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        responsables.forEach((usuario) => {
            const option = document.createElement("option");
            option.value = usuario.uid;
            option.textContent = usuario.nombre;
            filtroResponsable.appendChild(option);
        });
    } catch (error) {
        console.error("No se pudo cargar el listado de integrantes:", error);
    }
}

async function cargarActividades() {
    estadoCarga.hidden = false;
    estadoCarga.textContent = "Cargando agenda…";
    lista.innerHTML = "";

    try {
        let q;
        if (esAdmin) {
            q = query(coleccionAgenda);
        } else {
            q = query(coleccionAgenda, where("responsableUid", "==", perfil.uid));
        }

        const snap = await getDocs(q);
        actividades = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        actividades.sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
        estadoCarga.hidden = true;
        actualizarResumen();
        renderizarActividades();
    } catch (error) {
        console.error("Error cargando agenda:", error);
        estadoCarga.hidden = false;
        estadoCarga.textContent = error.code === "permission-denied"
            ? "La pantalla está preparada, pero Firestore todavía no permite acceder a la colección de agenda. No se modificaron las reglas de Firebase."
            : "No se pudo cargar la agenda. Revisá la conexión e intentá nuevamente.";
    }
}

function actualizarResumen() {
    const propiasOVistas = actividadesFiltradasPorResponsable();
    campo("cantidadPendientes").textContent = propiasOVistas.filter(a => a.estado === "pendiente").length;
    campo("cantidadEnCurso").textContent = propiasOVistas.filter(a => a.estado === "en_curso").length;
    campo("cantidadRealizadas").textContent = propiasOVistas.filter(a => a.estado === "realizada").length;
}

function actividadesFiltradasPorResponsable() {
    if (!esAdmin || filtroResponsable.value === "todos") return actividades;
    return actividades.filter(a => a.responsableUid === filtroResponsable.value);
}

function renderizarActividades() {
    const listaBase = actividadesFiltradasPorResponsable();
    const visibles = listaBase.filter(a => filtroActual === "todas" || a.estado === filtroActual);
    visibles.sort((a, b) => {
        if (a.estado === "realizada" && b.estado !== "realizada") return 1;
        if (b.estado === "realizada" && a.estado !== "realizada") return -1;
        return (a.fecha || "").localeCompare(b.fecha || "");
    });

    actualizarResumen();
    lista.innerHTML = "";

    if (!visibles.length) {
        estadoCarga.hidden = false;
        estadoCarga.textContent = listaBase.length
            ? "No hay actividades para este filtro."
            : "Todavía no hay actividades. Creá la primera con «Nueva actividad».";
        return;
    }

    estadoCarga.hidden = true;
    visibles.forEach((actividad) => lista.appendChild(crearTarjeta(actividad)));
}

function crearTarjeta(actividad) {
    const tarjeta = document.createElement("article");
    const hoy = fechaLocalHoy();
    const vencida = actividad.fecha && actividad.fecha < hoy && actividad.estado !== "realizada";
    tarjeta.className = "agenda-task prioridad-" + (actividad.prioridad || "media") + (vencida ? " is-overdue" : "");

    const top = document.createElement("div");
    top.className = "agenda-task-top";
    const info = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.textContent = actividad.titulo || "Actividad sin título";
    info.appendChild(titulo);

    const meta = document.createElement("div");
    meta.className = "agenda-task-meta";
    meta.appendChild(chip(formatearFecha(actividad.fecha), ""));
    meta.appendChild(chip("Prioridad " + etiquetaPrioridad(actividad.prioridad), ""));
    meta.appendChild(chip(etiquetaEstado(actividad.estado), "estado-" + (actividad.estado || "pendiente")));
    if (vencida) meta.appendChild(chip("Vencida", "vencida"));
    info.appendChild(meta);
    top.appendChild(info);

    if (esAdmin) {
        const nombre = document.createElement("span");
        nombre.className = "agenda-owner";
        nombre.textContent = "Responsable: " + (actividad.responsableNombre || "Usuario");
        top.appendChild(nombre);
    }
    tarjeta.appendChild(top);

    if (actividad.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "agenda-task-description";
        descripcion.textContent = actividad.descripcion;
        tarjeta.appendChild(descripcion);
    }

    if (actividad.responsableUid === perfil.uid) {
        const acciones = document.createElement("div");
        acciones.className = "agenda-task-actions";

        const cambiarEstado = document.createElement("button");
        cambiarEstado.type = "button";
        cambiarEstado.textContent = actividad.estado === "pendiente" ? "▶ Iniciar" : actividad.estado === "en_curso" ? "✓ Marcar realizada" : "↶ Reabrir";
        cambiarEstado.addEventListener("click", () => avanzarEstado(actividad));
        acciones.appendChild(cambiarEstado);

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => editarActividad(actividad));
        acciones.appendChild(editar);

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.textContent = "Eliminar";
        eliminar.addEventListener("click", () => eliminarActividad(actividad));
        acciones.appendChild(eliminar);
        tarjeta.appendChild(acciones);
    }

    return tarjeta;
}

function chip(texto, clase) {
    const elemento = document.createElement("span");
    elemento.className = "agenda-chip" + (clase ? " " + clase : "");
    elemento.textContent = texto;
    return elemento;
}

async function avanzarEstado(actividad) {
    const siguiente = actividad.estado === "pendiente" ? "en_curso" : actividad.estado === "en_curso" ? "realizada" : "pendiente";
    try {
        await updateDoc(doc(db, "agenda_actividades", actividad.id), {
            estado: siguiente,
            actualizadoEn: serverTimestamp(),
            completadoEn: siguiente === "realizada" ? serverTimestamp() : null
        });
        await cargarActividades();
    } catch (error) {
        console.error("Error cambiando estado:", error);
        alert(error.code === "permission-denied" ? "Firestore todavía no autoriza modificar las actividades de agenda." : "No se pudo actualizar el estado.");
    }
}

function editarActividad(actividad) {
    if (actividad.responsableUid !== perfil.uid) return;
    campo("actividadId").value = actividad.id;
    campo("tituloActividad").value = actividad.titulo || "";
    campo("fechaActividad").value = actividad.fecha || fechaLocalHoy();
    campo("prioridadActividad").value = actividad.prioridad || "media";
    campo("estadoActividad").value = actividad.estado || "pendiente";
    campo("descripcionActividad").value = actividad.descripcion || "";
    campo("tituloFormulario").textContent = "Editar actividad";
    mensajeFormulario.textContent = "";
    formPanel.hidden = false;
    formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function eliminarActividad(actividad) {
    if (actividad.responsableUid !== perfil.uid) return;
    if (!confirm("¿Eliminar la actividad «" + actividad.titulo + "»? Esta acción no se puede deshacer.")) return;
    try {
        await deleteDoc(doc(db, "agenda_actividades", actividad.id));

        // Actualizar la lista local sin volver a consultar toda la colección.
        actividades = actividades.filter(a => a.id !== actividad.id);
        actualizarResumen();
        renderizarActividades();
    } catch (error) {
        console.error("Error eliminando actividad:", error);
        alert(error.code === "permission-denied" ? "Firestore todavía no autoriza eliminar actividades de agenda." : "No se pudo eliminar la actividad.");
    }
}

function limpiarFormulario() {
    form.reset();
    campo("actividadId").value = "";
    campo("prioridadActividad").value = "media";
    campo("estadoActividad").value = "pendiente";
    mensajeFormulario.textContent = "";
}

function cerrarFormulario() {
    formPanel.hidden = true;
    limpiarFormulario();
}

function fechaLocalHoy() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return anio + "-" + mes + "-" + dia;
}

function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    const [anio, mes, dia] = fecha.split("-");
    return dia + "/" + mes + "/" + anio;
}

function etiquetaPrioridad(prioridad) {
    return prioridad === "alta" ? "alta" : prioridad === "baja" ? "baja" : "media";
}

function etiquetaEstado(estado) {
    return estado === "realizada" ? "Realizada" : estado === "en_curso" ? "En curso" : "Pendiente";
}

cargarActividades();
