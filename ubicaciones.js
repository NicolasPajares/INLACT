
/************************************************************
 * FIREBASE
 ************************************************************/


import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    writeBatch,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";



/**********************
 * ELEMENTOS
 **********************/
const listaUbicaciones = document.getElementById("listaUbicaciones");
const buscador = document.getElementById("buscadorUbicaciones");
const btnNuevaUbicacion = document.getElementById("btnNuevaUbicacion");
const btnVolver = document.getElementById("btnVolver");

/**********************
 * VARIABLES
 **********************/
let ubicaciones = [];

/**********************
 * BOTONES PRINCIPALES
 **********************/
btnNuevaUbicacion.addEventListener("click", () => {
    window.location.href = "nueva-ubicacion.html";
});

btnVolver.addEventListener("click", () => {
    window.location.href = "stock.html";
});

/**********************
 * CERRAR MENÚS AL
 * HACER CLIC AFUERA
 **********************/
document.addEventListener("click", (e) => {
    if (!e.target.closest(".acciones-ubicacion")) {
        cerrarMenus();
    }
});

function cerrarMenus() {
    document.querySelectorAll(".menu-lista").forEach(menu => {
        menu.hidden = true;
    });

    document.querySelectorAll(".btn-menu-lista").forEach(boton => {
        boton.setAttribute("aria-expanded", "false");
    });
}

/**********************
 * CARGAR UBICACIONES
 **********************/
async function cargarUbicaciones() {
    listaUbicaciones.innerHTML = `
        <li class="ubicacion-item">
            <div class="ubicacion-info">
                <strong>Cargando ubicaciones...</strong>
            </div>
        </li>
    `;

    try {
        let snapshot;

        try {
            const q = query(
                collection(db, "ubicaciones"),
                where("activo", "==", true),
                orderBy("nombre")
            );

            snapshot = await getDocs(q);

        } catch (errorConsulta) {
            console.warn(
                "No se pudo realizar la consulta ordenada. Se intentará una consulta alternativa.",
                errorConsulta
            );

            snapshot = await getDocs(collection(db, "ubicaciones"));
        }

        ubicaciones = [];

        snapshot.forEach(documento => {
            const datos = documento.data();

            if (datos.activo === true) {
                ubicaciones.push({
                    id: documento.id,
                    ...datos
                });
            }
        });

        ubicaciones.sort((a, b) =>
            String(a.nombre || "").localeCompare(
                String(b.nombre || ""),
                "es",
                { sensitivity: "base" }
            )
        );

        mostrarUbicacionesFiltradas();

    } catch (error) {
        console.error("Error al cargar ubicaciones:", error);

        listaUbicaciones.innerHTML = `
            <li class="ubicacion-item">
                <div class="ubicacion-info">
                    <strong>No se pudieron cargar las ubicaciones.</strong>
                    <p>Revisá la conexión e intentá nuevamente.</p>
                </div>
            </li>
        `;
    }
}

/**********************
 * MOSTRAR UBICACIONES
 **********************/
function mostrarUbicaciones(lista) {
    cerrarMenus();
    listaUbicaciones.innerHTML = "";

    if (lista.length === 0) {
        listaUbicaciones.innerHTML = `
            <li class="ubicacion-item">
                <div class="ubicacion-info">
                    <strong>No se encontraron ubicaciones.</strong>
                </div>
            </li>
        `;
        return;
    }

    lista.forEach(ubicacion => {
        const li = document.createElement("li");
        li.className = "ubicacion-item";

        const info = document.createElement("div");
        info.className = "ubicacion-info";

        const nombre = document.createElement("strong");
        nombre.textContent = ubicacion.nombre || "Sin nombre";

        info.appendChild(nombre);

        const acciones = document.createElement("div");
        acciones.className = "acciones-ubicacion";

        const btnMenu = document.createElement("button");
        btnMenu.type = "button";
        btnMenu.className = "btn-menu-lista";
        btnMenu.title = "Opciones";
        btnMenu.setAttribute("aria-label", `Opciones de ${ubicacion.nombre || "ubicación"}`);
        btnMenu.setAttribute("aria-expanded", "false");
        btnMenu.textContent = "⋮";

        const menu = document.createElement("div");
        menu.className = "menu-lista";
        menu.hidden = true;

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "opcion-menu-lista";
        btnEditar.textContent = "Editar";

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "opcion-menu-lista eliminar-lista";
        btnEliminar.textContent = "Eliminar";

        menu.append(btnEditar, btnEliminar);
        acciones.append(btnMenu, menu);
        li.append(info, acciones);
        listaUbicaciones.appendChild(li);

        /**********************
         * ABRIR / CERRAR MENÚ
         **********************/
        btnMenu.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const estabaAbierto = !menu.hidden;

            cerrarMenus();

            if (!estabaAbierto) {
                menu.hidden = false;
                btnMenu.setAttribute("aria-expanded", "true");
            }
        });

        /**********************
         * EDITAR
         **********************/
        btnEditar.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            cerrarMenus();

            window.location.href =
                `nueva-ubicacion.html?id=${encodeURIComponent(ubicacion.id)}`;
        });

        /**********************
         * ELIMINAR
         **********************/
        btnEliminar.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            cerrarMenus();

            const confirmar = confirm(
                `¿Querés eliminar la ubicación "${ubicacion.nombre}"?\n\n` +
                "Dejará de aparecer en el listado, pero el registro se conservará en Firebase."
            );

            if (!confirmar) return;

            btnEliminar.disabled = true;

            try {
                await updateDoc(
                    doc(db, "ubicaciones", ubicacion.id),
                    { activo: false }
                );

                ubicaciones = ubicaciones.filter(
                    item => item.id !== ubicacion.id
                );

                mostrarUbicacionesFiltradas();

                alert("Ubicación eliminada correctamente.");

            } catch (error) {
                console.error("Error al eliminar ubicación:", error);

                alert(
                    "No se pudo eliminar la ubicación. " +
                    "Revisá la conexión e intentá nuevamente."
                );

                btnEliminar.disabled = false;
            }
        });
    });
}

/**********************
 * BUSCADOR
 **********************/
function mostrarUbicacionesFiltradas() {
    const texto = buscador.value.toLowerCase().trim();

    const resultado = ubicaciones.filter(ubicacion =>
        String(ubicacion.nombre || "")
            .toLowerCase()
            .includes(texto)
    );

    mostrarUbicaciones(resultado);
}

buscador.addEventListener("input", mostrarUbicacionesFiltradas);

/**********************
 * INICIAR
 **********************/
cargarUbicaciones();
