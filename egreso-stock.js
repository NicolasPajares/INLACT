/*
************************************************************
* FIREBASE
************************************************************
*/

import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/*
************************************************************
* CONFIG FIREBASE
************************************************************
*/

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


/*
************************************************************
* ELEMENTOS
************************************************************
*/

const form =
    document.getElementById("formEgresoStock");

const tipoEgreso =
    document.getElementById("tipoEgreso");

const productoBuscador =
    document.getElementById("productoBuscador");

const listaProductos =
    document.getElementById("listaProductos");

const productoInput =
    document.getElementById("producto");

const ubicacionSelect =
    document.getElementById("ubicacion");

const loteSelect =
    document.getElementById("lote");

const cantidadDisponible =
    document.getElementById("cantidadDisponible");

const cantidadInput =
    document.getElementById("cantidad");

const unidadSelect =
    document.getElementById("unidad");

const contenedorCliente =
    document.getElementById("contenedorCliente");

const clienteBuscador =
    document.getElementById("clienteBuscador");

const listaClientes =
    document.getElementById("listaClientes");

const clienteInput =
    document.getElementById("cliente");

const fechaInput =
    document.getElementById("fecha");

const observacionInput =
    document.getElementById("observacion");


/*
************************************************************
* VARIABLES
************************************************************
*/

let productos = [];
let stock = [];
let clientes = [];

let productoSeleccionado = null;
let stockSeleccionado = null;


/*
************************************************************
* CARGAR PRODUCTOS
************************************************************
*/

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

        productos.sort((a, b) => {

            const nombreA =
                (
                    a.descripcion ||
                    a.nombre ||
                    ""
                ).toLowerCase();

            const nombreB =
                (
                    b.descripcion ||
                    b.nombre ||
                    ""
                ).toLowerCase();

            return nombreA.localeCompare(nombreB);

        });

        console.log(
            "Productos cargados:",
            productos.length
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


/*
************************************************************
* CARGAR STOCK
************************************************************
*/

async function cargarStock() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "stock")
            );

        stock = [];

        snapshot.forEach(docSnap => {

            const datos =
                docSnap.data();

            const cantidad =
                Number(
                    datos.cantidad || 0
                );

            /*
             * Solo stock disponible
             */

            if (cantidad > 0) {

                stock.push({

                    id:
                        docSnap.id,

                    productoId:
                        datos.productoId || "",

                    productoNombre:
                        datos.productoNombre || "",

                    lote:
                        datos.lote || "",

                    ubicacionId:
                        datos.ubicacionId ||
                        datos.ubicacionID ||
                        "",

                    ubicacionNombre:
                        datos.ubicacionNombre ||
                        "",

                    cantidad:
                        cantidad,

                    unidad:
                        datos.unidad || ""

                });

            }

        });

        console.log(
            "Stock cargado:",
            stock
        );

    } catch (error) {

        console.error(
            "Error cargando stock:",
            error
        );

        alert(
            "No se pudo cargar el stock."
        );

    }

}


/*
************************************************************
* CARGAR CLIENTES
************************************************************
*/

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

            clientes.push({

                id:
                    docSnap.id,

                ...datos

            });

        });

        clientes.sort((a, b) => {

            const nombreA =
                obtenerNombreCliente(a)
                    .toLowerCase();

            const nombreB =
                obtenerNombreCliente(b)
                    .toLowerCase();

            return nombreA.localeCompare(
                nombreB
            );

        });

        console.log(
            "Clientes cargados:",
            clientes.length
        );

    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        alert(
            "No se pudieron cargar los clientes."
        );

    }

}


/*
************************************************************
* NOMBRE CLIENTE
************************************************************
*/

function obtenerNombreCliente(cliente) {

    return (
        cliente.nombre ||
        cliente.razonSocial ||
        cliente.razon_social ||
        cliente.nombreFantasia ||
        cliente.nombreCompleto ||
        cliente.empresa ||
        "Cliente sin nombre"
    );

}


/*
************************************************************
* BUSCADOR DE PRODUCTOS
************************************************************
*/

productoBuscador.addEventListener(
    "input",
    () => {

        const texto =
            productoBuscador.value
                .toLowerCase()
                .trim();

        productoInput.value = "";

        productoSeleccionado = null;

        stockSeleccionado = null;

        ubicacionSelect.innerHTML = `
            <option value="">
                Seleccionar ubicación
            </option>
        `;

        loteSelect.innerHTML = `
            <option value="">
                Seleccionar lote
            </option>
        `;

        cantidadDisponible.value = "";

        listaProductos.innerHTML = "";

        if (texto === "") {

            return;

        }


        /*
         * Buscar producto
         */

        const resultados =
            productos.filter(producto => {

                const nombre =
                    (
                        producto.descripcion ||
                        producto.nombre ||
                        ""
                    )
                    .toLowerCase();

                const codigo =
                    (
                        producto.codigo ||
                        producto.codigoArt ||
                        ""
                    )
                    .toLowerCase();

                return (
                    nombre.includes(texto) ||
                    codigo.includes(texto)
                );

            });


        if (resultados.length === 0) {

            listaProductos.innerHTML = `
                <div class="resultado-producto">
                    No se encontraron productos.
                </div>
            `;

            return;

        }


        resultados.forEach(producto => {

            const opcion =
                document.createElement("div");

            opcion.className =
                "resultado-producto";

            opcion.textContent =
                producto.descripcion ||
                producto.nombre ||
                "Producto sin nombre";


            if (
                producto.codigo ||
                producto.codigoArt
            ) {

                opcion.textContent +=
                    " · " +
                    (
                        producto.codigo ||
                        producto.codigoArt
                    );

            }


            opcion.addEventListener(
                "click",
                () => {

                    seleccionarProducto(
                        producto
                    );

                }
            );


            listaProductos.appendChild(
                opcion
            );

        });

    }
);


/*
************************************************************
* SELECCIONAR PRODUCTO
************************************************************
*/

function seleccionarProducto(producto) {

    productoSeleccionado =
        producto;

    productoInput.value =
        producto.id;

    productoBuscador.value =
        producto.descripcion ||
        producto.nombre ||
        "";

    listaProductos.innerHTML = "";


    /*
     * Buscar TODAS las existencias
     * de ese producto
     */

    const existenciasProducto =
        stock.filter(item =>
            item.productoId === producto.id &&
            Number(item.cantidad) > 0
        );


    console.log(
        "Existencias del producto:",
        existenciasProducto
    );


    /*
     * Si no tiene stock
     */

    if (
        existenciasProducto.length === 0
    ) {

        alert(
            "Este producto no tiene stock disponible."
        );

        return;

    }


    /*
     * Crear lista de ubicaciones
     * sin repetir
     */

    const ubicacionesMap =
        new Map();


    existenciasProducto.forEach(item => {

        if (
            item.ubicacionId &&
            !ubicacionesMap.has(
                item.ubicacionId
            )
        ) {

            ubicacionesMap.set(
                item.ubicacionId,
                item.ubicacionNombre ||
                "Ubicación sin nombre"
            );

        }

    });


    ubicacionSelect.innerHTML = `
        <option value="">
            Seleccionar ubicación
        </option>
    `;


    ubicacionesMap.forEach(
        (nombre, id) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                id;

            option.textContent =
                nombre;

            ubicacionSelect.appendChild(
                option
            );

        }
    );


    /*
     * Limpiar lote
     */

    loteSelect.innerHTML = `
        <option value="">
            Seleccionar lote
        </option>
    `;

    cantidadDisponible.value = "";

}


/*
************************************************************
* CAMBIO DE UBICACIÓN
************************************************************
*/

ubicacionSelect.addEventListener(
    "change",
    () => {

        const ubicacionId =
            ubicacionSelect.value;

        loteSelect.innerHTML = `
            <option value="">
                Seleccionar lote
            </option>
        `;

        cantidadDisponible.value = "";

        stockSeleccionado = null;


        if (
            !productoSeleccionado ||
            !ubicacionId
        ) {

            return;

        }


        /*
         * Stock del producto
         * en esa ubicación
         */

        const existencias =
            stock.filter(item =>

                item.productoId ===
                    productoSeleccionado.id

                &&

                item.ubicacionId ===
                    ubicacionId

                &&

                Number(item.cantidad) > 0

            );


        console.log(
            "Stock en ubicación:",
            existencias
        );


        /*
         * Crear lotes
         */

        existencias.forEach(item => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                item.id;

            option.textContent =
                `${item.lote} · ${item.cantidad} ${item.unidad}`;

            loteSelect.appendChild(
                option
            );

        });

    }
);


/*
************************************************************
* CAMBIO DE LOTE
************************************************************
*/

loteSelect.addEventListener(
    "change",
    () => {

        const stockId =
            loteSelect.value;

        stockSeleccionado =
            stock.find(
                item =>
                    item.id === stockId
            );


        if (!stockSeleccionado) {

            cantidadDisponible.value =
                "";

            return;

        }


        cantidadDisponible.value =
            `${stockSeleccionado.cantidad} ${stockSeleccionado.unidad}`;


        /*
         * Sugerir unidad
         */

        const unidad =
            stockSeleccionado.unidad;

        if (unidad) {

            const existe =
                Array.from(
                    unidadSelect.options
                ).some(
                    option =>
                        option.value === unidad
                );

            if (existe) {

                unidadSelect.value =
                    unidad;

            }

        }

    }
);


/*
************************************************************
* TIPO DE EGRESO
************************************************************
*/

tipoEgreso.addEventListener(
    "change",
    () => {

        if (
            tipoEgreso.value ===
            "venta"
        ) {

            contenedorCliente.style.display =
                "block";

        } else {

            contenedorCliente.style.display =
                "none";

            clienteBuscador.value = "";

            clienteInput.value = "";

            listaClientes.innerHTML = "";

        }

    }
);


/*
************************************************************
* BUSCADOR DE CLIENTES
************************************************************
*/

clienteBuscador.addEventListener(
    "input",
    () => {

        const texto =
            clienteBuscador.value
                .toLowerCase()
                .trim();

        clienteInput.value = "";

        listaClientes.innerHTML = "";


        if (texto === "") {

            return;

        }


        const resultados =
            clientes.filter(cliente => {

                const nombre =
                    obtenerNombreCliente(
                        cliente
                    )
                    .toLowerCase();

                const codigo =
                    (
                        cliente.codigo ||
                        cliente.codigoCliente ||
                        ""
                    )
                    .toLowerCase();

                return (
                    nombre.includes(texto) ||
                    codigo.includes(texto)
                );

            });


        if (resultados.length === 0) {

            listaClientes.innerHTML = `
                <div class="resultado-cliente">
                    No se encontraron clientes.
                </div>
            `;

            return;

        }


        resultados.forEach(cliente => {

            const opcion =
                document.createElement(
                    "div"
                );

            opcion.className =
                "resultado-cliente";

            opcion.textContent =
                obtenerNombreCliente(
                    cliente
                );


            opcion.addEventListener(
                "click",
                () => {

                    clienteInput.value =
                        cliente.id;

                    clienteBuscador.value =
                        obtenerNombreCliente(
                            cliente
                        );

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


/*
************************************************************
* CLICK FUERA DE LOS BUSCADORES
************************************************************
*/

document.addEventListener(
    "click",
    event => {

        if (
            !productoBuscador.contains(
                event.target
            ) &&
            !listaProductos.contains(
                event.target
            )
        ) {

            listaProductos.innerHTML =
                "";

        }


        if (
            !clienteBuscador.contains(
                event.target
            ) &&
            !listaClientes.contains(
                event.target
            )
        ) {

            listaClientes.innerHTML =
                "";

        }

    }
);


/*
************************************************************
* FECHA ACTUAL
************************************************************
*/

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

    fechaInput.value =
        `${año}-${mes}-${dia}`;

}


/*
************************************************************
* INICIAR
************************************************************
*/

async function iniciar() {

    colocarFechaActual();


    /*
     * Al entrar como ajuste,
     * ocultamos cliente.
     */

    contenedorCliente.style.display =
        "none";


    await Promise.all([

        cargarProductos(),

        cargarStock(),

        cargarClientes()

    ]);

}

iniciar();


/*
============================================================
REGISTRAR EGRESO
============================================================
*/

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        try {

            /*
            ===============================
            VALIDACIONES
            ===============================
            */

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
                    cantidadInput.value
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


            const cantidadDisponibleActual =
                Number(
                    stockSeleccionado.cantidad
                );


            if (
                cantidadRetirar >
                cantidadDisponibleActual
            ) {

                alert(
                    `No podés retirar ${cantidadRetirar} ${stockSeleccionado.unidad}. ` +
                    `La cantidad disponible es ${cantidadDisponibleActual} ${stockSeleccionado.unidad}.`
                );

                return;

            }


            /*
            ===============================
            CLIENTE
            ===============================
            */

            let clienteId = "";
            let clienteNombre = "";

            if (
                tipoEgreso.value ===
                "venta"
            ) {

                clienteId =
                    clienteInput.value;

                clienteNombre =
                    clienteBuscador.value.trim();


                if (!clienteId) {

                    alert(
                        "Seleccioná un cliente."
                    );

                    return;

                }

            }


            /*
            ===============================
            NUEVA CANTIDAD
            ===============================
            */

            const nuevaCantidad =
                cantidadDisponibleActual -
                cantidadRetirar;


            /*
            ===============================
            CONFIRMACIÓN
            ===============================
            */

            const confirmar =
                confirm(
                    `¿Registrar egreso de ${cantidadRetirar} ${stockSeleccionado.unidad}?\n\n` +
                    `Producto: ${productoSeleccionado.descripcion || productoSeleccionado.nombre}\n` +
                    `Lote: ${stockSeleccionado.lote}\n` +
                    `Ubicación: ${stockSeleccionado.ubicacionNombre}\n` +
                    `Disponible después del egreso: ${nuevaCantidad} ${stockSeleccionado.unidad}`
                );


            if (!confirmar) {

                return;

            }


            /*
            ===============================
            DATOS COMUNES
            ===============================
            */

            const productoNombre =
                productoSeleccionado.descripcion ||
                productoSeleccionado.nombre ||
                "";

            const unidad =
                unidadSelect.value ||
                stockSeleccionado.unidad;

            const observacion =
                observacionInput.value.trim();

            const fecha =
                fechaInput.value;


            /*
            ===============================
            ACTUALIZAR STOCK
            ===============================
            */

            const stockRef =
                doc(
                    db,
                    "stock",
                    stockSeleccionado.id
                );


            await updateDoc(
                stockRef,
                {
                    cantidad:
                        nuevaCantidad
                }
            );


            /*
            ===============================
            REGISTRAR EGRESO
            ===============================
            */

            const egresoRef =
                await addDoc(
                    collection(db, "egresos"),
                    {

                        tipoEgreso:
                            tipoEgreso.value,

                        productoId:
                            productoSeleccionado.id,

                        productoNombre:
                            productoNombre,

                        lote:
                            stockSeleccionado.lote,

                        ubicacionId:
                            stockSeleccionado.ubicacionId,

                        ubicacionNombre:
                            stockSeleccionado.ubicacionNombre,

                        cantidad:
                            cantidadRetirar,

                        unidad:
                            unidad,

                        clienteId:
                            clienteId,

                        clienteNombre:
                            clienteNombre,

                        fecha:
                            fecha,

                        observacion:
                            observacion,

                        stockAnterior:
                            cantidadDisponibleActual,

                        stockPosterior:
                            nuevaCantidad,

                        creadoEn:
                            serverTimestamp()

                    }
                );


            /*
            ==================================================
            SI ES VENTA:
            REGISTRAR TAMBIÉN EN EL HISTORIAL DEL CLIENTE
            ==================================================
            */

            if (
                tipoEgreso.value ===
                "venta"
                &&
                clienteId
            ) {

                await addDoc(
                    collection(db, "visitas"),
                    {

                        /*
                         * Cliente
                         */

                        clienteId:
                            clienteId,

                        clienteNombre:
                            clienteNombre,


                        /*
                         * Tipo que verá cliente.js
                         */

                        tipoVisita:
                            "Venta",


                        /*
                         * Fecha
                         */

                        fecha:
                            fecha,


                        /*
                         * Producto vendido
                         */

                        productos: [

                            {

                                nombre:
                                    productoNombre,

                                cantidad:
                                    cantidadRetirar,

                                unidad:
                                    unidad,

                                lote:
                                    stockSeleccionado.lote

                            }

                        ],


                        /*
                         * Datos adicionales
                         */

                        ubicacionNombre:
                            stockSeleccionado.ubicacionNombre,

                        observacion:
                            observacion,


                        /*
                         * Referencia al egreso
                         */

                        egresoId:
                            egresoRef.id,


                        /*
                         * Fecha de creación
                         */

                        creadoEn:
                            serverTimestamp()

                    }
                );

            }


            /*
            ===============================
            MENSAJE
            ===============================
            */

            alert(
                "✅ Egreso registrado correctamente." +
                (
                    tipoEgreso.value === "venta"
                        ? "\n\nLa venta también fue agregada al historial del cliente."
                        : ""
                )
            );

            
            window.location.href = "stock.html";
            /*
            ===============================
            RECARGAR STOCK
            ===============================
            */

            await cargarStock();


            /*
            ===============================
            LIMPIAR FORMULARIO
            ===============================
            */

            form.reset();

            productoInput.value =
                "";

            productoSeleccionado =
                null;

            stockSeleccionado =
                null;

            listaProductos.innerHTML =
                "";

            listaClientes.innerHTML =
                "";

            cantidadDisponible.value =
                "";

            ubicacionSelect.innerHTML = `
                <option value="">
                    Seleccionar ubicación
                </option>
            `;

            loteSelect.innerHTML = `
                <option value="">
                    Seleccionar lote
                </option>
            `;

            contenedorCliente.style.display =
                "none";


            colocarFechaActual();


        } catch (error) {

            console.error(
                "ERROR REGISTRANDO EGRESO:",
                error
            );


            alert(
                "❌ No se pudo registrar el egreso.\n\n" +
                "Revisá la consola para ver el error."
            );

        }

    }
);
