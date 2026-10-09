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
const btnNuevoProducto = document.getElementById("btnNuevoProducto");
const btnVolver = document.getElementById("btnVolver");

const buscador = document.getElementById("buscadorProductos");
const lista = document.getElementById("listaProductos");

/**********************
 * VARIABLES
 **********************/
let productos = [];
let productosFiltrados = [];

/**********************
 * NAVEGACIÓN
 **********************/

btnNuevoProducto.addEventListener("click", () => {

    window.location.href = "nuevo-producto.html";

});

btnVolver.addEventListener("click", () => {

    window.location.href = "stock.html";

});

/**********************
 * CARGAR PRODUCTOS
 **********************/

async function cargarProductos() {

    productos = [];

    const snap = await getDocs(collection(db, "productos"));

    snap.forEach(doc => {

        const datos = doc.data();

        if (datos.activo !== false) {

            productos.push({

                id: doc.id,
                ...datos

            });

        }

    });

    productos.sort((a, b) =>
        a.descripcion.localeCompare(b.descripcion)
    );

    renderProductos(productos);

}

/**********************
 * RENDER
 **********************/

function renderProductos(listaProductos) {

    lista.innerHTML = "";

    if (listaProductos.length === 0) {

        lista.innerHTML = `
            <li>
                No hay productos cargados.
            </li>
        `;

        return;

    }
      listaProductos.forEach(prod => {

        const li = document.createElement("li");
        li.className = "producto-item";

        /*==============================
          INFORMACIÓN
        ==============================*/

        const info = document.createElement("div");
        info.className = "producto-info";

        info.innerHTML = `
            <strong>${prod.descripcion}</strong>
            <small>Código Art.: ${prod.codigo}</small>
        `;

        /*==============================
          BOTÓN ELIMINAR
        ==============================*/

        const btnBorrar = document.createElement("button");

        btnBorrar.className = "btn-borrar";

        btnBorrar.textContent = "✖";

        btnBorrar.onclick = (e) => {

            e.stopPropagation();

            alert(
                "Próximamente podrás editar, desactivar o eliminar este producto."
            );

        };

        li.appendChild(info);
        li.appendChild(btnBorrar);

        lista.appendChild(li);

    });

}

/**********************
 * BUSCADOR
 **********************/

buscador.addEventListener("input", () => {

    const texto = buscador.value.toLowerCase().trim();

    productosFiltrados = productos.filter(prod => {

        const descripcion = (prod.descripcion || "").toLowerCase();

        const codigo = (prod.codigo || "").toLowerCase();

        return descripcion.includes(texto) ||
               codigo.includes(texto);

    });

    renderProductos(productosFiltrados);

});

/**********************
 * INICIALIZAR
 **********************/

async function iniciar() {

    await cargarProductos();

}

iniciar();
