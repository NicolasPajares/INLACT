/****************************************************
 * FIREBASE
 ****************************************************/

import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    doc,
    runTransaction,
    addDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/****************************************************
 * CONFIG FIREBASE
 ****************************************************/

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


/****************************************************
 * ELEMENTOS
 ****************************************************/

const formulario =
    document.getElementById("formegresosoStock");

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


/****************************************************
 * VARIABLES
 ****************************************************/

let productos = [];
let clientes = [];
let stockDisponible = [];

let productoSeleccionado = null;
let stockSeleccionado = null;


/****************************************************
 * CARGAR PRODUCTOS
 ****************************************************/

async function cargarProductos() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "productos")
            );

        productos = [];

        snapshot.forEach(docSnap => {

            const datos = docSnap.data();

            if (datos.activo !== false) {

                productos.push({

                    id: docSnap.id,

                    ...datos

                });

            }

        });

        productos.sort((a, b) =>
            (a.descripcion || "")
            .localeCompare(
                b.descripcion || ""
            )
        );

    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        alert(
            "No se pudieron cargar los productos."
        );

    }

}


/****************************************************
 * BUSCADOR DE PRODUCTOS
 ****************************************************/

productoBuscador.addEventListener(
    "input",
    () => {

        const texto =
            productoBuscador.value
            .toLowerCase()
            .trim();

        productoSeleccionado = null;
        producto.value = "";

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

        if (texto === "") {

            listaProductos.innerHTML = "";

            return;

        }


        const resultados =
            productos.filter(p =>
                (p.descripcion || "")
                .toLowerCase()
                .includes(texto)
            );


        listaProductos.innerHTML = "";


        resultados.slice(0, 10).forEach(p => {

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

            listaProductos.appendChild(opcion);

        });

    }
);


/****************************************************
 * SELECCIONAR PRODUCTO
 ****************************************************/

function seleccionarProducto(p) {

    productoSeleccionado = p;

    producto.value = p.id;

    productoBuscador.value =
        p.descripcion;

    listaProductos.innerHTML = "";

    cargarStockProducto();

}


/****************************************************
 * CARGAR STOCK DEL PRODUCTO
 ****************************************************/

async function cargarStockProducto() {

    if (!productoSeleccionado) {
        return;
    }

    try {

        const q =
            query(
                collection(db, "stock"),
                where(
                    "productoId",
                    "==",
                    productoSeleccionado.id
                )
            );

        const snapshot =
            await getDocs(q);

        stockDisponible = [];

        snapshot.forEach(docSnap => {

            const datos =
                docSnap.data();

            const cantidadStock =
                Number(
                    datos.cantidad || 0
                );

            if (cantidadStock > 0) {

                stockDisponible.push({

                    id: docSnap.id,

                    ...datos,

                    cantidad:
                        cantidadStock

                });

            }

        });


        cargarUbicacionesDisponibles();


    } catch (error) {

        console.error(
            "Error cargando stock:",
            error
        );

        alert(
            "No se pudo cargar el stock del producto."
        );

    }

}


/****************************************************
 * CARGAR UBICACIONES DISPONIBLES
 ****************************************************/

function cargarUbicacionesDisponibles() {

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


    const ubicaciones = [];


    stockDisponible.forEach(stock => {

        const existe =
            ubicaciones.find(
                u =>
                    u.id ===
                    stock.ubicacionId
            );

        if (!existe) {

            ubicaciones.push({

                id:
                    stock.ubicacionId,

                nombre:
                    stock.ubicacionNombre

            });

        }

    });


    ubicaciones.sort((a, b) =>
        (a.nombre || "")
        .localeCompare(
            b.nombre || ""
        )
    );


    ubicaciones.forEach(u => {

        const option =
            document.createElement("option");

        option.value =
            u.id;

        option.textContent =
            u.nombre;

        ubicacion.appendChild(option);

    });

}


/****************************************************
 * CAMBIO DE UBICACIÓN
 ****************************************************/

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


        const lotes =
            stockDisponible.filter(
                stock =>
                    stock.ubicacionId ===
                    ubicacionId
            );


        lotes.forEach(stock => {

            const option =
                document.createElement("option");

            option.value =
                stock.id;

            option.textContent =
                `${stock.lote} · ${stock.cantidad} ${stock.unidad}`;

            lote.appendChild(option);

        });

    }
);


/****************************************************
 * CAMBIO DE LOTE
 ****************************************************/

lote.addEventListener(
    "change",
    () => {

        const stockId =
            lote.value;

        stockSeleccionado =
            stockDisponible.find(
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


        /*
         * Seleccionamos automáticamente
         * la unidad correspondiente al stock.
         */

        unidad.value =
            stockSeleccionado.unidad;

    }
);


/****************************************************
 * CARGAR CLIENTES
 ****************************************************/

async function cargarClientes() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "clientes")
            );

        clientes = [];

        snapshot.forEach(docSnap => {

            const datos =
                docSnap.data();

            if (datos.activo !== false) {

                clientes.push({

                    id:
                        docSnap.id,

                    ...datos

                });

            }

        });


        clientes.sort((a, b) =>
            (a.nombre || "")
            .localeCompare(
                b.nombre || ""
            )
        );


    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

    }

}


/****************************************************
 * MOSTRAR / OCULTAR CLIENTE
 ****************************************************/

tipoEgreso.addEventListener(
    "change",
    () => {

        const esVenta =
            tipoEgreso.value === "venta";


        if (esVenta) {

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


/****************************************************
 * BUSCADOR DE CLIENTES
 ****************************************************/

clienteBuscador.addEventListener(
    "input",
    () => {

        const texto =
            clienteBuscador.value
            .toLowerCase()
            .trim();

        cliente.value = "";

        listaClientes.innerHTML = "";


        if (texto === "") {
            return;
        }


        const resultados =
            clientes.filter(c =>
                (c.nombre || "")
                .toLowerCase()
                .includes(texto)
            );


        resultados.slice(0, 10).forEach(c => {

            const opcion =
                document.createElement("div");

            opcion.className =
                "opcion-cliente";

            opcion.textContent =
                c.nombre;

            opcion.addEventListener(
                "click",
                () => {

                    cliente.value =
                        c.id;

                    clienteBuscador.value =
                        c.nombre;

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


/****************************************************
 * REGISTRAR EGRESO
 ****************************************************/

formulario.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        /********************************************
         * VALIDACIONES
         ********************************************/

        if (!productoSeleccionado) {

            alert(
                "Seleccioná un producto."
            );

            return;

        }


        if (!stockSeleccionado) {

            alert(
                "Seleccioná un lote."
            );

            return;

        }


        const cantidadRetirar =
            Number(
                cantidad.value
            );


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
                `No podés retirar ${cantidadRetirar} ${stockSeleccionado.unidad}. ` +
                `El lote solamente tiene ${stockSeleccionado.cantidad} ${stockSeleccionado.unidad}.`
            );

            return;

        }


        if (
            tipoEgreso.value ===
            "venta" &&
            !cliente.value
        ) {

            alert(
                "Seleccioná un cliente para registrar la venta."
            );

            return;

        }


        /********************************************
         * DATOS
         ********************************************/

        const cantidadAnterior =
            stockSeleccionado.cantidad;

        const cantidadNueva =
            cantidadAnterior -
            cantidadRetirar;


        const fechaEgreso =
            fecha.value;


        const tipo =
            tipoEgreso.value;


        const observacionTexto =
            observacion.value.trim();


        try {

            /****************************************
             * ACTUALIZAR STOCK
             ****************************************/

            await runTransaction(
                db,
                async transaction => {

                    const stockRef =
                        doc(
                            db,
                            "stock",
                            stockSeleccionado.id
                        );


                    const stockSnap =
                        await transaction.get(
                            stockRef
                        );


                    if (!stockSnap.exists()) {

                        throw new Error(
                            "El registro de stock ya no existe."
                        );

                    }


                    const datosActuales =
                        stockSnap.data();


                    const cantidadActual =
                        Number(
                            datosActuales.cantidad ||
                            0
                        );


                    if (
                        cantidadRetirar >
                        cantidadActual
                    ) {

                        throw new Error(
                            "El stock disponible cambió. No hay cantidad suficiente."
                        );

                    }


                    const nuevoStock =
                        cantidadActual -
                        cantidadRetirar;


                    transaction.update(
                        stockRef,
                        {
                            cantidad:
                                nuevoStock,

                            actualizadoEn:
                                serverTimestamp()
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
                    "movimientos_stock"
                ),
                {

                    tipo:
                        "egreso",

                    tipoEgreso:
                        tipo,

                    productoId:
                        stockSeleccionado.productoId,

                    productoNombre:
                        stockSeleccionado.productoNombre,

                    lote:
                        stockSeleccionado.lote,

                    ubicacionId:
                        stockSeleccionado.ubicacionId,

                    ubicacionNombre:
                        stockSeleccionado.ubicacionNombre,

                    cantidad:
                        cantidadRetirar,

                    unidad:
                        stockSeleccionado.unidad,

                    fecha:
                        fechaEgreso,

                    observacion:
                        observacionTexto,

                    creadoEn:
                        serverTimestamp()

                }
            );


            /****************************************
             * SI ES VENTA:
             * REGISTRAR ENTREGA AL CLIENTE
             ****************************************/

            if (
                tipo ===
                "venta"
            ) {

                const clienteSeleccionado =
                    clientes.find(
                        c =>
                            c.id ===
                            cliente.value
                    );


                await addDoc(
                    collection(
                        db,
                        "entregas"
                    ),
                    {

                        clienteId:
                            cliente.value,

                        clienteNombre:
                            clienteSeleccionado
                                ?.nombre ||
                            "",

                        productoId:
                            stockSeleccionado.productoId,

                        productoNombre:
                            stockSeleccionado.productoNombre,

                        lote:
                            stockSeleccionado.lote,

                        ubicacionId:
                            stockSeleccionado.ubicacionId,

                        ubicacionNombre:
                            stockSeleccionado.ubicacionNombre,

                        cantidad:
                            cantidadRetirar,

                        unidad:
                            stockSeleccionado.unidad,

                        fecha:
                            fechaEgreso,

                        observacion:
                            observacionTexto,

                        creadoEn:
                            serverTimestamp()

                    }
                );

            }


            /****************************************
             * ÉXITO
             ****************************************/

            alert(
                tipo === "venta"
                    ? "Venta / entrega registrada correctamente."
                    : "Ajuste de stock registrado correctamente."
            );


            window.location.href =
                "stock.html";


        } catch (error) {

            console.error(
                "Error registrando egreso:",
                error
            );


            alert(
                "No se pudo registrar el egreso.\n\n" +
                error.message
            );

        }

    }
);


/****************************************************
 * FECHA POR DEFECTO
 ****************************************************/

function colocarFechaActual() {

    const hoy =
        new Date();

    const año =
        hoy.getFullYear();

    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoy.getDate()
        ).padStart(2, "0");


    fecha.value =
        `${año}-${mes}-${dia}`;

}


/****************************************************
 * INICIAR
 ****************************************************/

async function iniciar() {

    /*
     * Al principio ocultamos cliente.
     */

    contenedorCliente.style.display =
        "none";


    colocarFechaActual();


    await Promise.all([
        cargarProductos(),
        cargarClientes()
    ]);

}


iniciar();
