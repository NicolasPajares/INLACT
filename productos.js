
/************************************************************
 * FIREBASE
 ************************************************************/

import {
    collection,
    getDocs,
    doc,
    updateDoc
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
          MENÚ DE ACCIONES
        ==============================*/

        const contenedorAcciones = document.createElement("div");
        contenedorAcciones.className = "acciones-producto";

        const btnMenu = document.createElement("button");
        btnMenu.className = "btn-borrar";
        btnMenu.textContent = "⋮";
        btnMenu.type = "button";
        btnMenu.title = "Acciones del producto";

        const menu = document.createElement("div");
        menu.className = "menu-producto";
        menu.hidden = true;

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.textContent = "Editar";

        btnEditar.addEventListener("click", () => {
            window.location.href =
                `editar-producto.html?id=${encodeURIComponent(prod.id)}`;
        });

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.textContent = "Eliminar";

        btnEliminar.addEventListener("click", async () => {
            const confirmar = confirm(
                `¿Querés desactivar el producto "${prod.descripcion}"?\\n\\n` +
                "Dejará de aparecer en el catálogo, pero se conservará su historial."
            );

            if (!confirmar) return;

            btnEliminar.disabled = true;

            try {
                await updateDoc(doc(db, "productos", prod.id), {
                    activo: false
                });

                alert("Producto desactivado correctamente.");

                await cargarProductos();

            } catch (error) {
                console.error("Error al desactivar el producto:", error);
                alert("No se pudo desactivar el producto. Revisá la conexión e intentá nuevamente.");
                btnEliminar.disabled = false;
            }
        });

        btnMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.hidden = !menu.hidden;
        });

        menu.appendChild(btnEditar);
        menu.appendChild(btnEliminar);

        contenedorAcciones.appendChild(btnMenu);
        contenedorAcciones.appendChild(menu);

        li.appendChild(info);
        li.appendChild(contenedorAcciones);

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
