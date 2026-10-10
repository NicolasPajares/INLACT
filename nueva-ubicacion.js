/************************************************************
 * FIREBASE
 ************************************************************/

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

/**********************
 * ELEMENTOS
 **********************/
const form = document.getElementById("formUbicacion");
const nombre = document.getElementById("nombre");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

/**********************
 * MODO EDICIÓN
 **********************/
const parametros = new URLSearchParams(window.location.search);
const ubicacionId = parametros.get("id");
const modoEdicion = Boolean(ubicacionId);

let guardando = false;

/**********************
 * PREPARAR FORMULARIO
 **********************/
if (modoEdicion) {
    document.title = "INLACT · Editar Ubicación";

    const titulo = document.querySelector(".card h2");

    if (titulo) {
        titulo.textContent = "Editar Ubicación";
    }

    btnGuardar.textContent = "Guardar Cambios";

    cargarUbicacionParaEditar();
}

/**********************
 * CARGAR UBICACIÓN
 **********************/
async function cargarUbicacionParaEditar() {
    btnGuardar.disabled = true;

    try {
        const referencia = doc(db, "ubicaciones", ubicacionId);
        const resultado = await getDoc(referencia);

        if (!resultado.exists()) {
            alert("La ubicación que intentás editar no existe.");
            window.location.href = "ubicaciones.html";
            return;
        }

        const datos = resultado.data();

        if (datos.activo !== true) {
            alert("Esta ubicación está inactiva y no se puede editar desde el listado.");
            window.location.href = "ubicaciones.html";
            return;
        }

        nombre.value = datos.nombre || "";
        btnGuardar.disabled = false;

    } catch (error) {
        console.error("Error al cargar la ubicación:", error);

        alert("No se pudo cargar la ubicación. Intentá nuevamente.");
        window.location.href = "ubicaciones.html";
    }
}

/**********************
 * CANCELAR
 **********************/
btnCancelar.addEventListener("click", () => {
    window.location.href = "ubicaciones.html";
});

/**********************
 * VERIFICAR DUPLICADOS
 **********************/
async function ubicacionExiste(nombreUbicacion) {
    const q = query(
        collection(db, "ubicaciones"),
        where("nombre", "==", nombreUbicacion)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.some(documento => {
        const datos = documento.data();

        // Permite conservar el nombre de la propia ubicación al editar.
        if (modoEdicion && documento.id === ubicacionId) {
            return false;
        }

        // Solo considera duplicados las ubicaciones activas.
        return datos.activo === true;
    });
}

/**********************
 * GUARDAR / ACTUALIZAR
 **********************/
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (guardando) return;

    const nombreNuevo = nombre.value.trim();

    if (nombreNuevo === "") {
        alert("Debe ingresar el nombre de la ubicación.");
        nombre.focus();
        return;
    }

    guardando = true;
    btnGuardar.disabled = true;

    const textoOriginal = btnGuardar.textContent;
    btnGuardar.textContent = "Guardando...";

    try {
        if (await ubicacionExiste(nombreNuevo)) {
            alert("Ya existe una ubicación activa con ese nombre.");
            nombre.focus();
            nombre.select();
            return;
        }

        if (modoEdicion) {
            /**********************
             * ACTUALIZAR
             **********************/
            await updateDoc(
                doc(db, "ubicaciones", ubicacionId),
                {
                    nombre: nombreNuevo
                }
            );

            alert("Ubicación actualizada correctamente.");

        } else {
            /**********************
             * CREAR
             **********************/
            await addDoc(
                collection(db, "ubicaciones"),
                {
                    nombre: nombreNuevo,
                    activo: true,
                    fechaCreacion: Timestamp.now()
                }
            );

            alert("Ubicación creada correctamente.");
        }

        window.location.href = "ubicaciones.html";

    } catch (error) {
        console.error("Error al guardar la ubicación:", error);

        alert(
            "Ocurrió un error al guardar la ubicación. " +
            "Revisá la conexión e intentá nuevamente."
        );

    } finally {
        guardando = false;
        btnGuardar.disabled = false;
        btnGuardar.textContent = textoOriginal;
    }
});
