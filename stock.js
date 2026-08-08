/*********************************
 * FIREBASE
 *********************************/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/*********************************
 * CONFIG FIREBASE
 *********************************/

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


/*********************************
 * ELEMENTOS
 *********************************/

const btnProductos =
    document.getElementById("btnProductos");

const btnUbicaciones =
    document.getElementById("btnUbicaciones");

const btnIngreso =
    document.getElementById("btnIngreso");

const btnEgreso =
    document.getElementById("btnEgreso");

const btnTransferencia =
    document.getElementById("btnTransferencia");

const buscador =
    document.getElementById("buscadorStock");

const lista =
    document.getElementById("listaStock");


/*********************************
 * VARIABLES
 *********************************/

let existencias = [];


/*********************************
 * NAVEGACIÓN
 *********************************/

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


/*********************************
 * CARGAR STOCK
 *********************************/

async function cargarExistencias() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "stock")
            );


        existencias = [];


        snapshot.forEach(doc => {

            const datos = doc.data();


            /*
             * Solo guardamos registros
             * que tengan cantidad mayor a 0
             */

            const cantidad =
                Number(datos.cantidad || 0);


            if (cantidad > 0) {

                existencias.push({

                    id: doc.id,

                    productoId:
                        datos.productoId || "",

                    productoNombre:
                        datos.productoNombre || "Producto sin nombre",

                    ubicacionId:
                        datos.ubicacionId || "",

                    ubicacionNombre:
                        datos.ubicacionNombre || "Ubicación sin nombre",

                    cantidad:
                        cantidad,

                    unidad:
                        datos.unidad || ""

                });

            }

        });


        /*
         * Ordenamos por producto
         * y después por ubicación
         */

        existencias.sort((a, b) => {

            const producto =
                a.productoNombre.localeCompare(
                    b.productoNombre
                );

            if (producto !== 0) {

                return producto;

            }

            return a.ubicacionNombre.localeCompare(
                b.ubicacionNombre
            );

        });


        renderExistencias(existencias);


    } catch (error) {

        console.error(
            "Error cargando stock:",
            error
        );


        lista.innerHTML = `
            <li class="stock-item">
                <div class="stock-info">
                    <strong>Error al cargar el stock</strong>
                    <small>Revisá la consola para ver el error.</small>
                </div>
            </li>
        `;

    }

}


/*********************************
 * RENDER STOCK
 *********************************/

function renderExistencias(listaStock) {

    lista.innerHTML = "";


    if (listaStock.length === 0) {

        lista.innerHTML = `
            <li class="stock-item">
                <div class="stock-info">
                    <strong>No hay stock para mostrar.</strong>
                </div>
            </li>
        `;

        return;

    }


    listaStock.forEach(stock => {

        const li =
            document.createElement("li");

        li.className = "stock-item";


        const info =
            document.createElement("div");

        info.className = "stock-info";


        info.innerHTML = `
            <strong>${stock.productoNombre}</strong>

            <small>
                📍 ${stock.ubicacionNombre}
                ·
                ${stock.cantidad} ${stock.unidad}
            </small>
        `;


        li.appendChild(info);


        lista.appendChild(li);

    });

}


/*********************************
 * BUSCADOR
 *
 * Busca tanto:
 *
 * 1. PRODUCTO
 * 2. UBICACIÓN
 *********************************/

buscador.addEventListener("input", () => {

    const texto =
        buscador.value
        .toLowerCase()
        .trim();


    /*
     * Si no hay texto,
     * mostramos todo el stock.
     */

    if (texto === "") {

        renderExistencias(existencias);

        return;

    }


    /*
     * Buscamos en:
     *
     * productoNombre
     * ubicacionNombre
     */

    const resultado =
        existencias.filter(stock => {

            const producto =
                (stock.productoNombre || "")
                .toLowerCase();

            const ubicacion =
                (stock.ubicacionNombre || "")
                .toLowerCase();


            return (
                producto.includes(texto) ||
                ubicacion.includes(texto)
            );

        });


    renderExistencias(resultado);

});


/*********************************
 * INICIAR
 *********************************/

async function iniciar() {

    await cargarExistencias();

}


iniciar();
