
/************************************************************
 * FIREBASE
 ************************************************************/

import {
    collection,
    getDocs,
    getDoc,
    query,
    where,
    addDoc,
    doc,
    updateDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

/**********************
 * ELEMENTOS
 **********************/
const form = document.getElementById("formProducto");
const codigo = document.getElementById("codigo");
const descripcion = document.getElementById("descripcion");
const unidad = document.getElementById("unidad");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");

const titulo = document.querySelector("main h2");

/**********************
 * MODO EDICIÓN
 **********************/
const parametros = new URLSearchParams(window.location.search);
const productoId = parametros.get("id");

let productoOriginal = null;

async function cargarProductoParaEditar() {
    if (!productoId) return;

    try {
        const referencia = doc(db, "productos", productoId);
        const resultado = await getDoc(referencia);

        if (!resultado.exists()) {
            alert("El producto que querés editar no existe.");
            window.location.href = "productos.html";
            return;
        }

        productoOriginal = resultado.data();

        codigo.value = productoOriginal.codigo || "";
        descripcion.value = productoOriginal.descripcion || "";
        unidad.value = productoOriginal.unidad || "";

        if (titulo) titulo.textContent = "Editar Producto";
        btnGuardar.textContent = "Guardar Cambios";
        document.title = "INLACT · Editar Producto";

    } catch (error) {
        console.error("Error cargando producto:", error);
        alert("No se pudieron cargar los datos del producto.");
        window.location.href = "productos.html";
    }
}

/**********************
 * CANCELAR
 **********************/
btnCancelar.addEventListener("click", () => {
    window.location.href = "productos.html";
});

/**********************
 * VERIFICAR CÓDIGO
 **********************/
async function codigoExiste(cod) {
    const q = query(
        collection(db, "productos"),
        where("codigo", "==", cod)
    );

    const snap = await getDocs(q);

    // Al editar, no contar el propio producto como duplicado.
    return snap.docs.some(d => d.id !== productoId);
}

/**********************
 * GUARDAR PRODUCTO
 **********************/
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datosProducto = {
        codigo: codigo.value.trim(),
        descripcion: descripcion.value.trim(),
        unidad: unidad.value
    };

    /**********************
     * VALIDACIONES
     **********************/
    if (datosProducto.codigo === "") {
        alert("Debe ingresar el Código de Artículo.");
        codigo.focus();
        return;
    }

    if (datosProducto.descripcion === "") {
        alert("Debe ingresar la descripción.");
        descripcion.focus();
        return;
    }

    if (datosProducto.unidad === "") {
        alert("Debe seleccionar una unidad.");
        unidad.focus();
        return;
    }

    try {
        if (await codigoExiste(datosProducto.codigo)) {
            alert("Ya existe un producto con ese Código de Artículo.");
            codigo.focus();
            return;
        }

        btnGuardar.disabled = true;

        if (productoId) {
            // EDITAR: actualiza el documento existente.
            await updateDoc(
                doc(db, "productos", productoId),
                datosProducto
            );

            alert("Producto actualizado correctamente.");

        } else {
            // NUEVO: crea un documento nuevo.
            await addDoc(collection(db, "productos"), {
                ...datosProducto,
                activo: true,
                fechaCreacion: Timestamp.now()
            });

            alert("Producto creado correctamente.");
        }

        window.location.href = "productos.html";

    } catch (error) {
        console.error("Error guardando producto:", error);
        alert("Ocurrió un error al guardar el producto.");
        btnGuardar.disabled = false;
    }
});

/**********************
 * INICIO
 **********************/
cargarProductoParaEditar();
