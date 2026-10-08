
/*************************
 * FIREBASE
 *************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
    authDomain: "inlact.firebaseapp.com",
    projectId: "inlact",
    storageBucket: "inlact.firebasestorage.app",
    messagingSenderId: "143868382036",
    appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/*************************
 * ELEMENTOS DOM
 *************************/
const listaEnsayos = document.getElementById("listaEnsayos");
const buscador = document.getElementById("buscadorEnsayos");
const btnNuevoEnsayo = document.getElementById("btnNuevoEnsayo");

let ensayos = [];

/*************************
 * NUEVO ENSAYO
 *************************/
btnNuevoEnsayo.addEventListener("click", () => {
    window.location.href = "nuevo-ensayo.html";
});

/*************************
 * CERRAR MENÚS
 *************************/
document.addEventListener("click", () => {
    document.querySelectorAll(".menu-opciones-ensayo")
        .forEach(menu => menu.remove());

    document.querySelectorAll(".btn-menu-ensayo")
        .forEach(btn => btn.setAttribute("aria-expanded", "false"));
});

/*************************
 * CARGAR ENSAYOS
 *************************/
async function cargarEnsayos() {
    listaEnsayos.innerHTML = "<li>Cargando ensayos...</li>";

    try {
        const q = query(
            collection(db, "ensayos"),
            orderBy("fecha", "desc")
        );

        const snap = await getDocs(q);

        ensayos = [];

        snap.forEach(d => {
            ensayos.push({
                id: d.id,
                ...d.data()
            });
        });

        filtrarEnsayos();

    } catch (error) {
        console.error("Error cargando ensayos:", error);
        listaEnsayos.innerHTML =
            "<li>Error al cargar los ensayos.</li>";
    }
}

/*************************
 * MOSTRAR ENSAYOS
 *************************/
function renderEnsayos(lista) {
    listaEnsayos.innerHTML = "";

    if (lista.length === 0) {
        listaEnsayos.innerHTML =
            "<li>No se encontraron ensayos.</li>";
        return;
    }

    lista.forEach(e => {
        const li = document.createElement("li");
        li.className = "cliente-item";

        /* INFORMACIÓN DEL ENSAYO */
        const info = document.createElement("div");
        info.className = "cliente-info";

        const fecha = document.createElement("div");
        fecha.className = "fecha-ensayo";
        fecha.textContent = e.fecha?.toDate
            ? e.fecha.toDate().toLocaleDateString("es-AR")
            : "--/--/----";

        const cliente = document.createElement("div");
        cliente.className = "cliente-ensayo";
        cliente.textContent =
            e.clienteNombre || "Cliente sin nombre";

        const nombre = document.createElement("div");
        nombre.className = "nombre-ensayo";
        nombre.textContent =
            e.nombreEnsayo || "Ensayo sin nombre";

        info.appendChild(fecha);
        info.appendChild(cliente);
        info.appendChild(nombre);

        info.addEventListener("click", () => {
            window.location.href =
                `ensayo.html?id=${encodeURIComponent(e.id)}`;
        });

        /* CONTENEDOR DEL MENÚ */
        const contenedorMenu = document.createElement("div");
        contenedorMenu.className = "ensayo-menu-contenedor";

        /* BOTÓN DE TRES PUNTOS */
        const btnMenu = document.createElement("button");
        btnMenu.type = "button";
        btnMenu.className = "btn-menu-ensayo";
        btnMenu.textContent = "⋮";
        btnMenu.setAttribute("aria-label", "Acciones del ensayo");
        btnMenu.setAttribute("aria-expanded", "false");

        btnMenu.addEventListener("click", (ev) => {
            ev.stopPropagation();

            const menuExistente =
                contenedorMenu.querySelector(".menu-opciones-ensayo");

            if (menuExistente) {
                menuExistente.remove();
                btnMenu.setAttribute("aria-expanded", "false");
                return;
            }

            /* CERRAR OTROS MENÚS */
            document.querySelectorAll(".menu-opciones-ensayo")
                .forEach(menu => menu.remove());

            document.querySelectorAll(".btn-menu-ensayo")
                .forEach(btn => btn.setAttribute("aria-expanded", "false"));

            /* CREAR MENÚ */
            const menu = document.createElement("div");
            menu.className = "menu-opciones-ensayo";

            /* EDITAR */
            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.textContent = "Editar";

            btnEditar.addEventListener("click", (event) => {
                event.stopPropagation();

                window.location.href =
                    `nuevo-ensayo.html?id=${encodeURIComponent(e.id)}`;
            });

            /* ELIMINAR */
            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.className = "eliminar-ensayo";

            btnEliminar.addEventListener("click", async (event) => {
                event.stopPropagation();

                const ok = confirm(
                    `¿Querés borrar el ensayo "${e.nombreEnsayo || "Sin nombre"}"?`
                );

                if (!ok) return;

                btnEliminar.disabled = true;

                try {
                    await deleteDoc(doc(db, "ensayos", e.id));
                    await cargarEnsayos();
                } catch (error) {
                    console.error("Error eliminando ensayo:", error);
                    alert("No se pudo eliminar el ensayo. Intentá nuevamente.");
                    btnEliminar.disabled = false;
                }
            });

            menu.appendChild(btnEditar);
            menu.appendChild(btnEliminar);
            contenedorMenu.appendChild(menu);

            btnMenu.setAttribute("aria-expanded", "true");
        });

        contenedorMenu.appendChild(btnMenu);

        li.appendChild(info);
        li.appendChild(contenedorMenu);

        listaEnsayos.appendChild(li);
    });
}

/*************************
 * BUSCADOR
 *************************/
function filtrarEnsayos() {
    const texto = buscador.value.trim().toLowerCase();

    const filtrados = ensayos.filter(e =>
        (e.clienteNombre || "").toLowerCase().includes(texto) ||
        (e.nombreEnsayo || "").toLowerCase().includes(texto)
    );

    renderEnsayos(filtrados);
}

buscador.addEventListener("input", filtrarEnsayos);

/*************************
 * INIT
 *************************/
cargarEnsayos();
