/*************************************************
 * FIREBASE
 *************************************************/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    runTransaction,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/*************************************************
 * CONFIG FIREBASE
 *************************************************/

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


/*************************************************
 * ELEMENTOS
 *************************************************/

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

const cantidad =
    document.getElementById("cantidad");

const unidad =
    document.getElementById("unidad");

const contenedorCliente =
    document.getElementById("contenedorCliente");

const clienteBuscador =
    document.getElementById("clienteBuscador");

const listaClientes =
    document.getElementById("listaClientes");

const cliente =
    document.getElementById("cliente");

const fecha =
    document.getElementById("fecha");

const observacion =
    document.getElementById("observacion");


/*************************************************
 * VARIABLES
 *************************************************/

let productos = [];
let ubicaciones = [];
let clientes = [];
let existencias = [];

let stockSeleccionado = null;


/*************************************************
 * CARGAR PRODUCTOS
 *************************************************/

async function cargarProductos() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "productos")
            );

        productos = [];

        snapshot.forEach(docSnap => {

            const datos = docSnap.data();

            productos.push({
                id: docSnap.id,
                nombre:
                    datos.nombre ||
                    datos.descripcion ||
                    "Producto sin nombre"
            });

        });

        console.log(
            "Productos cargados:",
            productos
        );

    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

    }
}


/*************************************************
 * CARGAR UBICACIONES
 *************************************************/

async function cargarUbicaciones() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "ubicaciones")
            );

        ubicaciones = [];

        snapshot.forEach(docSnap => {

            const datos = docSnap.data();

            ubicaciones.push({
                id: docSnap.id,
                nombre:
                    datos.nombre ||
                    datos.descripcion ||
                    "Ubicación sin nombre"
            });

        });

        console.log(
            "Ubicaciones cargadas:",
            ubicaciones
        );

    } catch (error) {

        console.error(
            "Error cargando ubicaciones:",
            error
        );

    }
}


/*************************************************
 * CARGAR CLIENTES
 *************************************************/

async function cargarClientes() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "clientes")
            );

        clientes = [];

        snapshot.forEach(docSnap => {

            const datos = docSnap.data();

            clientes.push({
                id: docSnap.id,
                nombre:
                    datos.nombre ||
                    datos.nombreCliente ||
                    "Cliente sin nombre"
            });

        });

        console.log(
            "Clientes cargados:",
            clientes
        );

    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

    }
}


/*************************************************
 * CARGAR STOCK
 *************************************************/

async function cargarExistencias() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "stock")
            );

        existencias = [];

        snapshot.forEach(docSnap => {

            const datos = docSnap.data();

            const cantidadStock =
                Number(datos.cantidad || 0);

            if (cantidadStock > 0) {

                existencias.push({

                    id: docSnap.id,

                    productoId:
                        datos.productoId || "",

                    productoNombre:
                        datos.productoNombre ||
                        "Producto sin nombre",

                    ubicacionId:
                        datos.ubicacionId || "",

                    ubicacionNombre:
                        datos.ubicacionNombre ||
                        "Ubicación sin nombre",

                    lote:
                        datos.lote ||
                        "Sin lote",

                    cantidad:
                        cantidadStock,

                    unidad:
                        datos.unidad || ""

                });

            }

        });

        console.log(
            "Existencias cargadas:",
            existencias
        );

    } catch (error) {

        console.error(
            "Error cargando existencias:",
            error
        );

    }
}


/*************************************************
 * BUSCADOR DE PRODUCTOS
 *************************************************/

productoBuscador.addEventListener(
    "input",
    () => {

        const texto =
            productoBuscador.value
                .toLowerCase()
                .trim();

        producto.value = "";

        listaProductos.innerHTML = "";

        if (!texto) {

            return;

        }

        const resultados =
            productos.filter(item =>
                item.nombre
                    .toLowerCase()
                    .includes(texto)
            );

        resultados.forEach(item => {

            const opcion =
                document.createElement("div");

            opcion.textContent =
                item.nombre;

            opcion.className =
                "opcion-producto";

            opcion.addEventListener(
                "click",
                () => {

                    productoBuscador.value =
                        item.nombre;

                    producto.value =
                        item.id;

                    listaProductos.innerHTML = "";

                    cargarUbicacionesProducto(
                        item.id
                    );

                }
            );

            listaProductos.appendChild(
                opcion
            );

        });

    }
);


/*************************************************
 * UBICACIONES DEL PRODUCTO
 *************************************************/

function cargarUbicacionesProducto(
    productoId
) {

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

    const ubicacionesIds =
        [
            ...new Set(
                existencias
                    .filter(stock =>
                        stock.productoId === productoId
                    )
                    .map(stock =>
                        stock.ubicacionId
                    )
            )
        ];

    ubicacionesIds.forEach(
        ubicacionId => {

            const stock =
                existencias.find(
                    item =>
                        item.productoId === productoId &&
                        item.ubicacionId === ubicacionId
                );

            if (!stock) {
                return;
            }

            const opcion =
                document.createElement("option");

            opcion.value =
                ubicacionId;

            opcion.textContent =
                stock.ubicacionNombre;

            ubicacion.appendChild(
                opcion
            );

        }
    );

}


/*************************************************
 * CAMBIO DE UBICACIÓN
 *************************************************/

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

        const productoId =
            producto.value;

        const ubicacionId =
            ubicacion.value;

        if (
            !productoId ||
            !ubicacionId
        ) {

            return;

        }

        const lotes =
            existencias.filter(
                stock =>
                    stock.productoId === productoId &&
                    stock.ubicacionId === ubicacionId &&
                    Number(stock.cantidad) > 0
            );

        lotes.forEach(
            stock => {

                const opcion =
                    document.createElement("option");

                opcion.value =
                    stock.id;

                opcion.textContent =
                    `${stock.lote} — ${stock.cantidad} ${stock.unidad}`;

                lote.appendChild(
                    opcion
                );

            }
        );

    }
);


/*************************************************
 * CAMBIO DE LOTE
 *************************************************/

lote.addEventListener(
    "change",
    () => {

        const stockId =
            lote.value;

        stockSeleccionado =
            existencias.find(
                stock =>
                    stock.id === stockId
            );

        if (!stockSeleccionado) {

            cantidadDisponible.value =
                "";

            return;

        }

        cantidadDisponible.value =
            `${stockSeleccionado.cantidad} ${stockSeleccionado.unidad}`;

        unidad.value =
            stockSeleccionado.unidad;

        cantidad.max =
            stockSeleccionado.cantidad;

    }
);


/*************************************************
 * BUSCADOR DE CLIENTES
 *************************************************/

clienteBuscador.addEventListener(
    "input",
    () => {

        const texto =
            clienteBuscador.value
                .toLowerCase()
                .trim();

        cliente.value = "";

        listaClientes.innerHTML = "";

        if (!texto) {

            return;

        }

        const resultados =
            clientes.filter(item =>
                item.nombre
                    .toLowerCase()
                    .includes(texto)
            );

        resultados.forEach(item => {

            const opcion =
                document.createElement("div");

            opcion.textContent =
                item.nombre;

            opcion.className =
                "opcion-cliente";

            opcion.addEventListener(
                "click",
                () => {

                    clienteBuscador.value =
                        item.nombre;

                    cliente.value =
                        item.id;

                    listaClientes.innerHTML =
                        "";

                }
            );

            listaClientes.appendChild(
                opcion
            );

        });

    }
);


/*************************************************
 * TIPO DE EGRESO
 *************************************************/

tipoEgreso.addEventListener(
    "change",
    () => {

        if (
            tipoEgreso.value === "venta"
        ) {

            contenedorCliente.style.display =
                "block";

            clienteBuscador.required =
                true;

        } else {

            contenedorCliente.style.display =
                "none";

            clienteBuscador.required =
                false;

            clienteBuscador.value =
                "";

            cliente.value =
                "";

            listaClientes.innerHTML =
                "";

        }

    }
);


/*************************************************
 * VALIDAR CANTIDAD
 *************************************************/

cantidad.addEventListener(
    "input",
    () => {

        if (!stockSeleccionado) {
            return;
        }

        const valor =
            Number(cantidad.value);

        if (
            valor >
            stockSeleccionado.cantidad
        ) {

            cantidad.value =
                stockSeleccionado.cantidad;

        }

    }
);


/*************************************************
 * GUARDAR EGRESO
 *************************************************/

formulario.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!stockSeleccionado) {

            alert(
                "Seleccioná un producto, ubicación y lote."
            );

            return;

        }

        const cantidadRetirar =
            Number(cantidad.value);

        if (
            !cantidadRetirar ||
            cantidadRetirar <= 0
        ) {

            alert(
                "Ingresá una cantidad válida."
            );

            return;

        }

        if (
            cantidadRetirar >
            stockSeleccionado.cantidad
        ) {

            alert(
                "No podés retirar más cantidad de la disponible."
            );

            return;

        }

        if (
            tipoEgreso.value === "venta" &&
            !cliente.value
        ) {

            alert(
                "Seleccioná un cliente."
            );

            return;

        }

        try {

            const stockRef =
                doc(
                    db,
                    "stock",
                    stockSeleccionado.id
                );

            await runTransaction(
                db,
                async transaction => {

                    const stockDoc =
                        await transaction.get(
                            stockRef
                        );

                    if (!stockDoc.exists()) {

                        throw new Error(
                            "El registro de stock ya no existe."
                        );

                    }

                    const datos =
                        stockDoc.data();

                    const cantidadActual =
                        Number(
                            datos.cantidad || 0
                        );

                    if (
                        cantidadRetirar >
                        cantidadActual
                    ) {

                        throw new Error(
                            "La cantidad disponible cambió. Actualizá la página."
                        );

                    }

                    const nuevaCantidad =
                        cantidadActual -
                        cantidadRetirar;

                    transaction.update(
                        stockRef,
                        {
                            cantidad:
                                nuevaCantidad
                        }
                    );

                }
            );


            /****************************************
             * REGISTRAR MOVIMIENTO
             ****************************************/

            await addDoc(
                collection(
                    db,
                    "movimientosStock"
                ),
                {

                    tipo:
                        tipoEgreso.value,

                    productoId:
                        stockSeleccionado.productoId,

                    productoNombre:
                        stockSeleccionado.productoNombre,

                    ubicacionId:
                        stockSeleccionado.ubicacionId,

                    ubicacionNombre:
                        stockSeleccionado.ubicacionNombre,

                    lote:
                        stockSeleccionado.lote,

                    cantidad:
                        cantidadRetirar,

                    unidad:
                        stockSeleccionado.unidad,

                    clienteId:
                        cliente.value || null,

                    clienteNombre:
                        clienteBuscador.value || null,

                    fecha:
                        fecha.value,

                    observacion:
                        observacion.value || "",

                    creadoEn:
                        serverTimestamp()

                }
            );


            alert(
                "Egreso registrado correctamente."
            );

            window.location.href =
                "stock.html";

        } catch (error) {

            console.error(
                "Error registrando egreso:",
                error
            );

            alert(
                error.message ||
                "No se pudo registrar el egreso."
            );

        }

    }
);


/*************************************************
 * INICIAR
 *************************************************/

async function iniciar() {

    contenedorCliente.style.display =
        "none";

    await Promise.all([

        cargarProductos(),

        cargarUbicaciones(),

        cargarClientes(),

        cargarExistencias()

    ]);

}

iniciar();
