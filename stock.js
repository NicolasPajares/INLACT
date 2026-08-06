/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
    authDomain: "inlact.firebaseapp.com",
    projectId: "inlact",
    storageBucket: "inlact.appspot.com",
    messagingSenderId: "143868382036",
    appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**********************
 * ELEMENTOS
 **********************/

const btnProductos = document.getElementById("btnProductos");
const btnUbicaciones = document.getElementById("btnUbicaciones");
const btnIngreso = document.getElementById("btnIngreso");
const btnEgreso = document.getElementById("btnEgreso");
const btnTransferencia = document.getElementById("btnTransferencia");

const ubicacionSelect = document.getElementById("ubicacionSeleccionada");
const buscador = document.getElementById("buscadorStock");
const lista = document.getElementById("listaStock");

/**********************
 * VARIABLES
 **********************/

let ubicaciones = [];
let existencias = [];
let existenciasFiltradas = [];

/**********************
 * NAVEGACIÓN
 **********************/

btnProductos.addEventListener("click", () => {
    window.location.href = "productos.html";
});

btnUbicaciones.addEventListener("click", () => {
    window.location.href = "ubicaciones.html";
});

btnIngreso.addEventListener("click", () => {
    window.location.href = "ingreso-stock.html";
});

btnEgreso.addEventListener("click", () => {
    window.location.href = "egreso-stock.html";
});

btnTransferencia.addEventListener("click", () => {
    window.location.href = "transferencia-stock.html";
});

/**********************
 * CARGAR UBICACIONES
 **********************/

async function cargarUbicaciones() {

    ubicacionSelect.innerHTML =
        `<option value="">Seleccionar ubicación...</option>`;

    const snap = await getDocs(collection(db, "ubicaciones"));

    ubicaciones = [];

    snap.forEach(doc => {

        const datos = doc.data();

        if (datos.activo !== false) {

            ubicaciones.push({
                id: doc.id,
                ...datos
            });

        }

    });

    ubicaciones.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
    );

    ubicaciones.forEach(u => {

        const option = document.createElement("option");

        option.value = u.id;
        option.textContent = u.nombre;

        ubicacionSelect.appendChild(option);

    });

}

/**********************
 * CARGAR EXISTENCIAS
 *
 * (Temporal)
 * Luego leeremos
 * movimientos_stock
 **********************/

function cargarExistencias() {

    existencias = [];

    renderExistencias([]);

}

/**********************
 * RENDER
 **********************/

function renderExistencias(listaProductos) {

    lista.innerHTML = "";

    if (listaProductos.length === 0) {

        lista.innerHTML =
            "<li>No hay productos para mostrar.</li>";

        return;

    }
    listaProductos.forEach(p => {

        const li = document.createElement("li");
        li.className = "stock-item";

        /*==============================
          INFORMACIÓN
        ==============================*/

        const info = document.createElement("div");
        info.className = "stock-info";

        info.innerHTML = `
            <strong>${p.descripcion}</strong>
            <small>${p.cantidad}</small>
        `;

        /*==============================
          BOTÓN BORRAR
        ==============================*/

        const btnBorrar = document.createElement("button");
        btnBorrar.className = "btn-borrar";
        btnBorrar.textContent = "✖";

        btnBorrar.onclick = (e) => {

            e.stopPropagation();

            alert(
                "Más adelante este botón permitirá editar, desactivar o eliminar el producto."
            );

        };

        li.appendChild(info);
        li.appendChild(btnBorrar);

        lista.appendChild(li);

    });

}

/**********************
 * CAMBIO DE UBICACIÓN
 **********************/

ubicacionSelect.addEventListener("change", () => {

    cargarExistencias();

});

/**********************
 * BUSCADOR
 **********************/

buscador.addEventListener("input", () => {

    const texto = buscador.value.toLowerCase();

    existenciasFiltradas = existencias.filter(p =>
        (p.descripcion || "")
        .toLowerCase()
        .includes(texto)
    );

    renderExistencias(existenciasFiltradas);

});

/**********************
 * INIT
 **********************/

async function iniciar() {

    await cargarUbicaciones();

    cargarExistencias();

}

iniciar();
