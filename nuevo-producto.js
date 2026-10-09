/************************************************************
 * FIREBASE
 ************************************************************/

import {
    collection,
    getDocs
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

    return !snap.empty;

}
/**********************
 * GUARDAR PRODUCTO
 **********************/
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nuevoProducto = {

        codigo: codigo.value.trim(),

        descripcion: descripcion.value.trim(),

        unidad: unidad.value,

        activo: true,

        fechaCreacion: Timestamp.now()

    };

    /*==============================
      VALIDACIONES
    ==============================*/

    if (nuevoProducto.codigo === "") {

        alert("Debe ingresar el Código de Artículo.");

        codigo.focus();

        return;

    }

    if (nuevoProducto.descripcion === "") {

        alert("Debe ingresar la descripción.");

        descripcion.focus();

        return;

    }

    if (nuevoProducto.unidad === "") {

        alert("Debe seleccionar una unidad.");

        unidad.focus();

        return;

    }

    /*==============================
      CÓDIGO DUPLICADO
    ==============================*/

    if (await codigoExiste(nuevoProducto.codigo)) {

        alert("Ya existe un producto con ese Código de Artículo.");

        codigo.focus();

        return;

    }

    /*==============================
      GUARDAR EN FIRESTORE
    ==============================*/

    try{

        await addDoc(

            collection(db,"productos"),

            nuevoProducto

        );

        alert("Producto creado correctamente.");

        window.location.href = "productos.html";

    }

    catch(error){

        console.error(error);

        alert("Ocurrió un error al guardar el producto.");

    }

});
