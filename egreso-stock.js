/* =========================================================
   FIREBASE
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =========================================================
   CONFIG FIREBASE
========================================================= */

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


/* =========================================================
   ELEMENTOS
========================================================= */

const formulario =
    document.getElementById("formEgresoStock");

const tipoEgreso =
    document.getElementById("tipoEgreso");

const productoBuscador =
    document.getElementById("productoBuscador");

const listaProductos =
    document.getElementById("listaProductos");

const producto =
    document.getElementById("producto");

const ubicacion =
    document.getElementById("ubicacion");

const lote =
    document.getElementById("lote");

const cantidadDisponible =
    document.getElementById("cantidadDisponible");

const clienteBuscador =
    document.getElementById("clienteBuscador");

const listaClientes =
    document.getElementById("listaClientes");

const cliente =
    document.getElementById("cliente");

const contenedorCliente =
    document.getElementById("contenedorCliente");


/* =========================================================
   VARIABLES
========================================================= */

let productos = [];
let ubicaciones = [];
let stock = [];
let clientes = [];

let productoSeleccionado = null;
let stockSeleccionado = null;


/* =========================================================
   CARGAR PRODUCTOS
========================================================= */

async function cargarProductos() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "productos")
            );

        productos = [];

        snapshot.forEach(doc => {

            const datos = doc.data();

            productos.push({

                id: doc.id,

                descripcion:
                    datos.descripcion ||
                    datos.nombre ||
                    "Producto sin nombre"

            });

        });

        productos.sort((a, b) =>
            a.descripcion.localeCompare(
                b.descripcion
            )
        );

        console.log(
            "Productos cargados:",
            productos.length
        );

    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

    }

}


/* =========================================================
   BUSCAR PRODUCTOS
========================================================= */

productoBuscador.addEventListener(
    "input",
    () => {

        const texto =
            productoBuscador.value
                .toLowerCase()
                .trim();

        productoSeleccionado = null;

        producto.value = "";

        limpiarUbicaciones();

        if (texto === "") {

            listaProductos.innerHTML = "";

            return;

        }


        const resultados =
            productos.filter(p =>
                p.descripcion
                    .toLowerCase()
                    .includes(texto)
            );


        listaProductos.innerHTML = "";


        resultados.forEach(p => {

            const opcion =
                document.createElement("div");

            opcion.className =
                "opcion-producto";

            opcion.textContent =
                p.descripcion;


            opcion.addEventListener(
                "click",
                () => {

                    seleccionarProducto(p);

                }
            );


            listaProductos.appendChild(
                opcion
            );

        });

    }
);


/* =========================================================
   SELECCIONAR PRODUCTO
========================================================= */

function seleccionarProducto(p) {

    productoSeleccionado = p;

    productoBuscador.value =
        p.descripcion;

    producto.value =
        p.id;

    listaProductos.innerHTML = "";

    limpiarUbicaciones();

    cargarUbicacionesParaProducto();

}


/* =========================================================
   CARGAR UBICACIONES
   SOLO LAS QUE TIENEN STOCK DEL PRODUCTO
========================================================= */

async function cargarUbicacionesParaProducto() {

    if (!productoSeleccionado) {
        return;
    }

    try {

        const snapshot =
            await getDocs(
                collection(db, "stock")
            );

        stock = [];

        snapshot.forEach(doc => {

            const datos = doc.data();

            const cantidad =
                Number(datos.cantidad || 0);

            if (
                cantidad > 0 &&
                datos.productoId ===
                    productoSeleccionado.id
            ) {

                stock.push({

                    id: doc.id,

                    productoId:
                        datos.productoId,

                    productoNombre:
                        datos.productoNombre || "",

                    lote:
                        datos.lote || "",

                    ubicacionId:
                        datos.ubicacionId || "",

                    ubicacionNombre:
                        datos.ubicacionNombre || "",

                    cantidad:
                        cantidad,

                    unidad:
                        datos.unidad || ""

                });

            }

        });


        /*
         * Obtener ubicaciones únicas
         */

        const idsUbicaciones =
            new Set();


        stock.forEach(s => {

            if (s.ubicacionId) {

                idsUbicaciones.add(
                    s.ubicacionId
                );

            }

        });


        ubicacion.innerHTML = `
            <option value="">
                Seleccionar ubicación
            </option>
        `;


        const ubicacionesStock =
            Array.from(idsUbicaciones);


        ubicacionesStock.forEach(id => {

            const item =
                stock.find(
                    s =>
                        s.ubicacionId === id
                );

            if (!item) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );

            option.value =
                item.ubicacionId;

            option.textContent =
                item.ubicacionNombre ||
                "Ubicación sin nombre";


            ubicacion.appendChild(
                option
            );

        });


        /*
         * Si no hay stock
         */

        if (stock.length === 0) {

            ubicacion.innerHTML = `
                <option value="">
                    Sin stock disponible
                </option>
            `;

        }

    } catch (error) {

        console.error(
            "Error cargando ubicaciones:",
            error
        );

    }

}


/* =========================================================
   CAMBIO DE UBICACIÓN
========================================================= */

ubicacion.addEventListener(
    "change",
    () => {

        lote.innerHTML = `
            <option value="">
                Seleccionar lote
            </option>
        `;

        cantidadDisponible.value = "";

        stockSeleccionado = null;


        const ubicacionId =
            ubicacion.value;

        if (!ubicacionId) {
            return;
        }


        const stockUbicacion =
            stock.filter(
                s =>
                    s.ubicacionId ===
                    ubicacionId &&
                    s.cantidad > 0
            );


        /*
         * Ordenar lotes
         */

        stockUbicacion.sort((a, b) =>
            a.lote.localeCompare(b.lote)
        );


        stockUbicacion.forEach(s => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                s.id;

            option.textContent =
                s.lote ||
                "Sin lote";

            lote.appendChild(
                option
            );

        });

    }
);


/* =========================================================
   CAMBIO DE LOTE
========================================================= */

lote.addEventListener(
    "change",
    () => {

        const stockId =
            lote.value;

        cantidadDisponible.value = "";

        stockSeleccionado = null;


        if (!stockId) {
            return;
        }


        const seleccionado =
            stock.find(
                s =>
                    s.id === stockId
            );


        if (!seleccionado) {
            return;
        }


        stockSeleccionado =
            seleccionado;


        cantidadDisponible.value =
            `${seleccionado.cantidad} ${seleccionado.unidad}`;

    }
);


/* =========================================================
   CARGAR CLIENTES
========================================================= */

async function cargarClientes() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "clientes")
            );

        clientes = [];

        snapshot.forEach(doc => {

            const datos = doc.data();

            clientes.push({

                id: doc.id,

                nombre:
                    datos.nombre ||
                    datos.nombreCliente ||
                    "Cliente sin nombre"

            });

        });


        clientes.sort((a, b) =>
            a.nombre.localeCompare(
                b.nombre
            )
        );


        console.log(
            "Clientes cargados:",
            clientes.length
        );

    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

    }

}


/* =========================================================
   BUSCAR CLIENTES
========================================================= */

clienteBuscador.addEventListener(
    "input",
    () => {

        const texto =
            clienteBuscador.value
                .toLowerCase()
                .trim();

        cliente.value = "";


        if (texto === "") {

            listaClientes.innerHTML = "";

            return;

        }


        const resultados =
            clientes.filter(c =>
                c.nombre
                    .toLowerCase()
                    .includes(texto)
            );


        listaClientes.innerHTML = "";


        resultados.forEach(c => {

            const opcion =
                document.createElement("div");

            opcion.className =
                "opcion-cliente";

            opcion.textContent =
                c.nombre;


            opcion.addEventListener(
                "click",
                () => {

                    seleccionarCliente(c);

                }
            );


            listaClientes.appendChild(
                opcion
            );

        });

    }
);


/* =========================================================
   SELECCIONAR CLIENTE
========================================================= */

function seleccionarCliente(c) {

    clienteBuscador.value =
        c.nombre;

    cliente.value =
        c.id;

    listaClientes.innerHTML = "";

}


/* =========================================================
   MOSTRAR / OCULTAR CLIENTE
========================================================= */

tipoEgreso.addEventListener(
    "change",
    () => {

        const tipo =
            tipoEgreso.value;


        if (tipo === "venta") {

            contenedorCliente.style.display =
                "block";

            clienteBuscador.required =
                true;

        } else {

            contenedorCliente.style.display =
                "none";

            clienteBuscador.required =
                false;

            clienteBuscador.value = "";

            cliente.value = "";

            listaClientes.innerHTML = "";

        }

    }
);


/* =========================================================
   LIMPIAR UBICACIONES
========================================================= */

function limpiarUbicaciones() {

    ubicacion.innerHTML = `
        <option value="">
            Seleccionar ubicación
        </option>
    `;

    lote.innerHTML = `
        <option value="">
            Seleccionar lote
        </option>
    `;

    cantidadDisponible.value = "";

    stockSeleccionado = null;

}


/* =========================================================
   FORMULARIO
========================================================= */

formulario.addEventListener(
    "submit",
    (e) => {

        e.preventDefault();

        alert(
            "La carga de datos funciona correctamente. Todavía no registramos el egreso."
        );

    }
);


/* =========================================================
   INICIO
========================================================= */

async function iniciar() {

    /*
     * El cliente empieza oculto.
     */

    contenedorCliente.style.display =
        "none";


    await Promise.all([

        cargarProductos(),

        cargarClientes()

    ]);

}


iniciar();
