
/************************************************************
 * FIREBASE
 ************************************************************/

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";
import { obtenerPerfilUsuario } from "./proteger.js";


/************************************************************
 * ELEMENTOS
 ************************************************************/

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


/************************************************************
 * PERMISOS
 ************************************************************/

const perfil = obtenerPerfilUsuario();
const esAdmin = perfil?.rol === "admin";

// Productos y Ubicaciones son exclusivos del administrador.
if (btnProductos) {
    btnProductos.hidden = !esAdmin;
}

if (btnUbicaciones) {
    btnUbicaciones.hidden = !esAdmin;
}


/************************************************************
 * VARIABLES
 ************************************************************/

let existencias = [];


/************************************************************
 * NAVEGACIÓN
 ************************************************************/

if (esAdmin && btnProductos) {
    btnProductos.addEventListener("click", () => {
        window.location.href = "productos.html";
    });
}

if (esAdmin && btnUbicaciones) {
    btnUbicaciones.addEventListener("click", () => {
        window.location.href = "ubicaciones.html";
    });
}

if (btnIngreso) {
    btnIngreso.addEventListener("click", () => {
        window.location.href = "ingreso-stock.html";
    });
}

if (btnEgreso) {
    btnEgreso.addEventListener("click", () => {
        window.location.href = "egreso-stock.html";
    });
}

if (btnTransferencia) {
    btnTransferencia.addEventListener("click", () => {
        window.location.href = "transferencia-stock.html";
    });
}


/************************************************************
 * CARGAR STOCK
 ************************************************************/

async function cargarExistencias() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "stock")
            );

        existencias = [];

        snapshot.forEach(documento => {

            const datos = documento.data();

            const cantidad =
                Number(datos.cantidad || 0);

            // Solo mostramos stock disponible.
            if (cantidad > 0) {

                existencias.push({

                    id: documento.id,

                    productoId:
                        datos.productoId || "",

                    productoNombre:
                        datos.productoNombre ||
                        "Producto sin nombre",

                    lote:
                        datos.lote ||
                        "Sin lote",

                    // Aceptamos ambas variantes del campo.
                    ubicacionId:
                        datos.ubicacionID ||
                        datos.ubicacionId ||
                        "",

                    ubicacionNombre:
                        datos.ubicacionNombre ||
                        "Ubicación sin nombre",

                    cantidad: cantidad,

                    unidad:
                        datos.unidad || "",

                    observacion:
                        datos.observacion || ""

                });

            }

        });


        /********************************************************
         * ORDEN: PRODUCTO, UBICACIÓN Y LOTE
         ********************************************************/

        existencias.sort((a, b) => {

            const producto =
                a.productoNombre.localeCompare(
                    b.productoNombre
                );

            if (producto !== 0) {
                return producto;
            }

            const ubicacion =
                a.ubicacionNombre.localeCompare(
                    b.ubicacionNombre
                );

            if (ubicacion !== 0) {
                return ubicacion;
            }

            return a.lote.localeCompare(b.lote);

        });


        // No mostramos existencias hasta realizar una búsqueda.
        lista.innerHTML = "";

    } catch (error) {

        console.error("Error cargando stock:", error);

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


/************************************************************
 * MOSTRAR RESULTADOS
 ************************************************************/

function renderExistencias(listaStock) {

    lista.innerHTML = "";

    if (listaStock.length === 0) {

        lista.innerHTML = `
            <li class="stock-item">
                <div class="stock-info">
                    <strong>No se encontraron resultados.</strong>
                </div>
            </li>
        `;

        return;

    }

    listaStock.forEach(stock => {

        const li = document.createElement("li");
        li.className = "stock-item";

        const info = document.createElement("div");
        info.className = "stock-info";

        info.innerHTML = `
            <strong>${stock.productoNombre}</strong>

            <small>📍 ${stock.ubicacionNombre}</small>

            <small>🏷️ Lote: ${stock.lote}</small>

            <small>📦 ${stock.cantidad} ${stock.unidad}</small>

            ${stock.observacion ? `
                <small>📝 ${stock.observacion}</small>
            ` : ""}
        `;

        li.appendChild(info);
        lista.appendChild(li);

    });

}


/************************************************************
 * BUSCADOR
 *
 * Busca por producto, ubicación o lote.
 ************************************************************/

if (buscador) {

    buscador.addEventListener("input", () => {

        const texto =
            buscador.value.toLowerCase().trim();

        // Sin búsqueda, la lista queda vacía.
        if (texto === "") {
            lista.innerHTML = "";
            return;
        }

        const resultado =
            existencias.filter(stock => {

                const producto =
                    (stock.productoNombre || "")
                    .toLowerCase();

                const ubicacion =
                    (stock.ubicacionNombre || "")
                    .toLowerCase();

                const lote =
                    (stock.lote || "")
                    .toLowerCase();

                return (
                    producto.includes(texto) ||
                    ubicacion.includes(texto) ||
                    lote.includes(texto)
                );

            });

        renderExistencias(resultado);

    });

}


/************************************************************
 * INICIAR
 ************************************************************/

async function iniciar() {
    await cargarExistencias();
}

iniciar();
