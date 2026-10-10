
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
 * CERRAR MENÚS AL HACER CLIC AFUERA
 **********************/
document.addEventListener("click", () => {
    document.querySelectorAll(".menu-opciones-cliente")
        .forEach(menu => menu.remove());

    document.querySelectorAll(".btn-menu-cliente")
        .forEach(boton => boton.setAttribute("aria-expanded", "false"));
});

/**********************
 * CARGAR PRODUCTOS
 **********************/
async function cargarProductos() {
    lista.innerHTML = "<li>Cargando productos...</li>";

    try {
        const snap = await getDocs(collection(db, "productos"));

        productos = [];

        snap.forEach(documento => {
            const datos = documento.data();

            // Los productos desactivados no aparecen en el catálogo.
            if (datos.activo !== false) {
                productos.push({
                    id: documento.id,
                    ...datos
                });
            }
        });

        productos.sort((a, b) =>
            (a.descripcion || "").localeCompare(b.descripcion || "")
        );

        filtrarProductos();

    } catch (error) {
        console.error("Error cargando productos:", error);
        lista.innerHTML = "<li>Error al cargar los productos.</li>";
    }
}

/**********************
 * MOSTRAR PRODUCTOS
 **********************/
function renderProductos(listaProductos) {
    lista.innerHTML = "";

    if (listaProductos.length === 0) {
        lista.innerHTML = "<li>No se encontraron productos.</li>";
        return;
    }

    listaProductos.forEach(prod => {
        const li = document.createElement("li");
        li.className = "producto-item";

        /**********************
         * INFORMACIÓN
         **********************/
        const info = document.createElement("div");
        info.className = "producto-info";

        const nombre = document.createElement("strong");
        nombre.textContent = prod.descripcion || "Sin descripción";

        const codigo = document.createElement("small");
        codigo.textContent = `Código Art.: ${prod.codigo || "Sin código"}`;

        info.appendChild(nombre);
        info.appendChild(document.createElement("br"));
        info.appendChild(codigo);

        /**********************
         * CONTENEDOR DEL MENÚ
         **********************/
        const contenedorMenu = document.createElement("div");
        contenedorMenu.className = "cliente-menu-contenedor";

        const btnMenu = document.createElement("button");
        btnMenu.type = "button";
        btnMenu.className = "btn-menu-cliente";
        btnMenu.textContent = "⋮";
        btnMenu.setAttribute("aria-label", "Acciones del producto");
        btnMenu.setAttribute("aria-expanded", "false");

        /**********************
         * ABRIR / CERRAR MENÚ
         **********************/
        btnMenu.addEventListener("click", (e) => {
            e.stopPropagation();

            const menuActual = contenedorMenu.querySelector(
                ".menu-opciones-cliente"
            );

            if (menuActual) {
                menuActual.remove();
                btnMenu.setAttribute("aria-expanded", "false");
                return;
            }

            document.querySelectorAll(".menu-opciones-cliente")
                .forEach(menu => menu.remove());

            document.querySelectorAll(".btn-menu-cliente")
                .forEach(boton =>
                    boton.setAttribute("aria-expanded", "false")
                );

            const menu = document.createElement("div");
            menu.className = "menu-opciones-cliente";

            /**********************
             * OPCIÓN EDITAR
             **********************/
            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.textContent = "Editar";

            btnEditar.addEventListener("click", (ev) => {
                ev.stopPropagation();

                window.location.href =
                    `nuevo-producto.html?id=${encodeURIComponent(prod.id)}`;
            });

            /**********************
             * OPCIÓN ELIMINAR
             **********************/
            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.className = "eliminar-cliente";

            btnEliminar.addEventListener("click", async (ev) => {
                ev.stopPropagation();

                const ok = confirm(
                    `¿Querés desactivar el producto "${prod.descripcion || "Sin descripción"}"?\n\nNo aparecerá en el catálogo, pero se conservará su registro para el historial de stock.`
                );

                if (!ok) return;

                btnEliminar.disabled = true;

                try {
                    await updateDoc(
                        doc(db, "productos", prod.id),
                        { activo: false }
                    );

                    menu.remove();
                    await cargarProductos();

                } catch (error) {
                    console.error("Error desactivando producto:", error);
                    alert("No se pudo desactivar el producto. Intentá nuevamente.");
                    btnEliminar.disabled = false;
                }
            });

            menu.appendChild(btnEditar);
            menu.appendChild(btnEliminar);
            contenedorMenu.appendChild(menu);

            btnMenu.setAttribute("aria-expanded", "true");
        });

        /**********************
         * ARMAR FILA
         **********************/
        contenedorMenu.appendChild(btnMenu);
        li.appendChild(info);
        li.appendChild(contenedorMenu);
        lista.appendChild(li);
    });
}

/**********************
 * BUSCADOR
 **********************/
function filtrarProductos() {
    const texto = buscador.value.trim().toLowerCase();

    const filtrados = productos.filter(prod => {
        const descripcion = (prod.descripcion || "").toLowerCase();
        const codigo = (prod.codigo || "").toLowerCase();

        return descripcion.includes(texto) ||
               codigo.includes(texto);
    });

    renderProductos(filtrados);
}

buscador.addEventListener("input", filtrarProductos);

/**********************
 * INICIALIZAR
 **********************/
cargarProductos();
