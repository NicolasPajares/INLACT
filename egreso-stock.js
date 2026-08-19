/*
************************************************************
* EGRESO DE STOCK
* VENTA / ENTREGA / AJUSTE
************************************************************
*/


/*
************************************************************
* FIREBASE
************************************************************
*/

import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    writeBatch,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/*
************************************************************
* CONFIG FIREBASE
************************************************************
*/

const firebaseConfig = {

    apiKey:
        "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",

    authDomain:
        "inlact.firebaseapp.com",

    projectId:
        "inlact",

    storageBucket:
        "inlact.firebasestorage.app",

    messagingSenderId:
        "143868382036",

    appId:
        "1:143868382036:web:b5af0e4faced7e880216c1"

};


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


/*
************************************************************
* ELEMENTOS PRINCIPALES
************************************************************
*/

const form =
    document.getElementById(
        "formEgresoStock"
    );


const tipoEgreso =
    document.getElementById(
        "tipoEgreso"
    );


const fechaInput =
    document.getElementById(
        "fecha"
    );


const contenedorCliente =
    document.getElementById(
        "contenedorCliente"
    );


const clienteBuscador =
    document.getElementById(
        "clienteBuscador"
    );


const listaClientes =
    document.getElementById(
        "listaClientes"
    );


const clienteInput =
    document.getElementById(
        "cliente"
    );


const articulosEgreso =
    document.getElementById(
        "articulosEgreso"
    );


const btnAgregarArticulo =
    document.getElementById(
        "btnAgregarArticulo"
    );


const resumenEgreso =
    document.getElementById(
        "resumenEgreso"
    );


const listaResumenEgreso =
    document.getElementById(
        "listaResumenEgreso"
    );


/*
************************************************************
* VARIABLES
************************************************************
*/

let productos = [];

let stock = [];

let clientes = [];

let contadorArticulos = 1;


/*
************************************************************
* CARGAR PRODUCTOS
************************************************************
*/

async function cargarProductos() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "productos"
                )
            );


        productos = [];


        snapshot.forEach(
            docSnap => {

                const datos =
                    docSnap.data();


                if (
                    datos.activo !== false
                ) {

                    productos.push({

                        id:
                            docSnap.id,

                        ...datos

                    });

                }

            }
        );


        productos.sort(
            (a, b) => {

                const nombreA =
                    (
                        a.descripcion ||
                        a.nombre ||
                        ""
                    )
                    .toLowerCase();


                const nombreB =
                    (
                        b.descripcion ||
                        b.nombre ||
                        ""
                    )
                    .toLowerCase();


                return nombreA.localeCompare(
                    nombreB
                );

            }
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
                collection(
                    db,
                    "stock"
                )
            );


        stock = [];


        snapshot.forEach(
            docSnap => {

                const datos =
                    docSnap.data();


                const cantidad =
                    Number(
                        datos.cantidad || 0
                    );


                if (
                    cantidad > 0
                ) {

                    stock.push({

                        id:
                            docSnap.id,

                        productoId:
                            datos.productoId ||
                            "",

                        productoNombre:
                            datos.productoNombre ||
                            "",

                        lote:
                            datos.lote ||
                            "",

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
                            datos.unidad ||
                            ""

                    });

                }

            }
        );


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
                collection(
                    db,
                    "clientes"
                )
            );


        clientes = [];


        snapshot.forEach(
            docSnap => {

                const datos =
                    docSnap.data();


                clientes.push({

                    id:
                        docSnap.id,

                    ...datos

                });

            }
        );


        clientes.sort(
            (a, b) => {

                const nombreA =
                    obtenerNombreCliente(
                        a
                    )
                    .toLowerCase();


                const nombreB =
                    obtenerNombreCliente(
                        b
                    )
                    .toLowerCase();


                return nombreA.localeCompare(
                    nombreB
                );

            }
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

function obtenerNombreCliente(
    cliente
) {

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
* NOMBRE PRODUCTO
************************************************************
*/

function obtenerNombreProducto(
    producto
) {

    return (

        producto.descripcion ||

        producto.nombre ||

        "Producto sin nombre"

    );

}


/*
************************************************************
* OBTENER ARTÍCULOS
************************************************************
*/

function obtenerArticulos() {

    return Array.from(
        document.querySelectorAll(
            ".articulo-egreso"
        )
    );

}


/*
************************************************************
* CREAR NUEVO ARTÍCULO
************************************************************
*/

function crearArticulo() {

    contadorArticulos++;


    const numero =
        contadorArticulos;


    const articulo =
        document.createElement(
            "div"
        );


    articulo.className =
        "articulo-egreso";


    articulo.dataset.articulo =
        numero;


    articulo.innerHTML = `

        <hr>

        <h3>
            Producto ${numero}
        </h3>


        <label for="productoBuscador-${numero}">
            Producto
        </label>


        <input
            type="text"
            id="productoBuscador-${numero}"
            class="productoBuscador"
            placeholder="Escribí para buscar un producto..."
            autocomplete="off"
            required
        >


        <div
            class="listaProductos"
            id="listaProductos-${numero}"
        ></div>


        <input
            type="hidden"
            class="producto"
            id="producto-${numero}"
        >


        <label for="ubicacion-${numero}">
            Ubicación de origen
        </label>


        <select
            id="ubicacion-${numero}"
            class="ubicacion"
            required
        >

            <option value="">
                Seleccionar ubicación
            </option>

        </select>


        <label for="lote-${numero}">
            Lote
        </label>


        <select
            id="lote-${numero}"
            class="lote"
            required
        >

            <option value="">
                Seleccionar lote
            </option>

        </select>


        <div
            class="disponibilidad-lote"
            id="disponibilidad-${numero}"
        ></div>


        <label for="cantidad-${numero}">
            Cantidad a entregar
        </label>


        <input
            type="number"
            id="cantidad-${numero}"
            class="cantidad"
            placeholder="Ej: 10"
            min="0.01"
            step="any"
            required
        >


        <label for="observacion-${numero}">
            Observación
        </label>


        <textarea
            id="observacion-${numero}"
            class="observacion"
            placeholder="Ej: Entrega al cliente / Ajuste por inventario"
            rows="3"
        ></textarea>


        <button
            type="button"
            class="btn-eliminar-articulo"
        >
            ✖ Quitar producto
        </button>

    `;


    articulosEgreso.appendChild(
        articulo
    );


    configurarArticulo(
        articulo
    );


    actualizarResumen();

}


/*
************************************************************
* CONFIGURAR ARTÍCULO
************************************************************
*/

function configurarArticulo(
    articulo
) {

    const buscador =
        articulo.querySelector(
            ".productoBuscador"
        );


    const lista =
        articulo.querySelector(
            ".listaProductos"
        );


    const productoInput =
        articulo.querySelector(
            ".producto"
        );


    const ubicacion =
        articulo.querySelector(
            ".ubicacion"
        );


    const lote =
        articulo.querySelector(
            ".lote"
        );


    const disponibilidad =
        articulo.querySelector(
            ".disponibilidad-lote"
        );


    const cantidad =
        articulo.querySelector(
            ".cantidad"
        );


    const observacion =
        articulo.querySelector(
            ".observacion"
        );


    let productoSeleccionado =
        null;


    let stockSeleccionado =
        null;


    /*
    ============================================================
    BUSCADOR PRODUCTO
    ============================================================
    */

    buscador.addEventListener(
        "input",
        () => {

            const texto =
                buscador.value
                    .toLowerCase()
                    .trim();


            productoInput.value =
                "";


            productoSeleccionado =
                null;


            stockSeleccionado =
                null;


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


            disponibilidad.textContent =
                "";


            lista.innerHTML =
                "";


            if (
                texto === ""
            ) {

                actualizarResumen();

                return;

            }


            const resultados =
                productos.filter(
                    producto => {

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

                            nombre.includes(
                                texto
                            )

                            ||

                            codigo.includes(
                                texto
                            )

                        );

                    }
                );


            if (
                resultados.length === 0
            ) {

                lista.innerHTML = `
                    <div class="resultado-producto">
                        No se encontraron productos.
                    </div>
                `;

                return;

            }


            resultados.forEach(
                producto => {

                    const opcion =
                        document.createElement(
                            "div"
                        );


                    opcion.className =
                        "resultado-producto";


                    opcion.textContent =
                        obtenerNombreProducto(
                            producto
                        );


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


                    lista.appendChild(
                        opcion
                    );

                }
            );

        }
    );


    /*
    ============================================================
    SELECCIONAR PRODUCTO
    ============================================================
    */

    function seleccionarProducto(
        producto
    ) {

        productoSeleccionado =
            producto;


        productoInput.value =
            producto.id;


        buscador.value =
            obtenerNombreProducto(
                producto
            );


        lista.innerHTML =
            "";


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


        disponibilidad.textContent =
            "";


        stockSeleccionado =
            null;


        const existencias =
            stock.filter(
                item =>

                    item.productoId ===
                    producto.id

                    &&

                    Number(
                        item.cantidad
                    ) > 0
            );


        if (
            existencias.length === 0
        ) {

            alert(
                "Este producto no tiene stock disponible."
            );

            return;

        }


        const ubicacionesMap =
            new Map();


        existencias.forEach(
            item => {

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

            }
        );


        ubicacionesMap.forEach(
            (
                nombre,
                id
            ) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    id;


                option.textContent =
                    nombre;


                ubicacion.appendChild(
                    option
                );

            }
        );


        actualizarResumen();

    }


    /*
    ============================================================
    CAMBIO UBICACIÓN
    ============================================================
    */

    ubicacion.addEventListener(
        "change",
        () => {

            const ubicacionId =
                ubicacion.value;


            lote.innerHTML = `
                <option value="">
                    Seleccionar lote
                </option>
            `;


            disponibilidad.textContent =
                "";


            stockSeleccionado =
                null;


            if (
                !productoSeleccionado ||
                !ubicacionId
            ) {

                actualizarResumen();

                return;

            }


            const existencias =
                stock.filter(
                    item =>

                        item.productoId ===
                        productoSeleccionado.id

                        &&

                        item.ubicacionId ===
                        ubicacionId

                        &&

                        Number(
                            item.cantidad
                        ) > 0
                );


            existencias.forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        item.id;


                    option.textContent =
    `${item.lote} · ${item.cantidad} ${item.unidad}`;


                    lote.appendChild(
                        option
                    );

                }
            );


            actualizarResumen();

        }
    );


    /*
    ============================================================
    CAMBIO LOTE
    ============================================================
    */

    lote.addEventListener(
        "change",
        () => {

            const stockId =
                lote.value;


            stockSeleccionado =
                stock.find(
                    item =>
                        item.id ===
                        stockId
                );


            if (
                !stockSeleccionado
            ) {

                disponibilidad.textContent =
                    "";

                actualizarResumen();

                return;

            }


            /*
             * MOSTRAR DISPONIBILIDAD
             * JUNTO AL LOTE
             */

            disponibilidad.textContent =
                `Disponible: ${stockSeleccionado.cantidad} ${stockSeleccionado.unidad}`;


            actualizarResumen();

        }
    );


    /*
    ============================================================
    CAMBIOS CANTIDAD / OBSERVACIÓN
    ============================================================
    */

    cantidad.addEventListener(
        "input",
        actualizarResumen
    );


    observacion.addEventListener(
        "input",
        actualizarResumen
    );


    /*
    ============================================================
    ELIMINAR ARTÍCULO
    ============================================================
    */

    const btnEliminar =
        articulo.querySelector(
            ".btn-eliminar-articulo"
        );


    if (
        btnEliminar
    ) {

        btnEliminar.addEventListener(
            "click",
            () => {

                const articulos =
                    obtenerArticulos();


                if (
                    articulos.length <= 1
                ) {

                    alert(
                        "Debe quedar al menos un producto."
                    );

                    return;

                }


                articulo.remove();


                actualizarResumen();

            }
        );

    }

}


/*
************************************************************
* CONFIGURAR CLIENTE
************************************************************
*/

function configurarCliente() {

    if (
        !clienteBuscador
    ) {

        return;

    }


    clienteBuscador.addEventListener(
        "input",
        () => {

            const texto =
                clienteBuscador.value
                    .toLowerCase()
                    .trim();


            clienteInput.value =
                "";


            listaClientes.innerHTML =
                "";


            if (
                texto === ""
            ) {

                return;

            }


            const resultados =
                clientes.filter(
                    cliente => {

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

                            nombre.includes(
                                texto
                            )

                            ||

                            codigo.includes(
                                texto
                            )

                        );

                    }
                );


            if (
                resultados.length === 0
            ) {

                listaClientes.innerHTML = `
                    <div class="resultado-cliente">
                        No se encontraron clientes.
                    </div>
                `;

                return;

            }


            resultados.forEach(
                cliente => {

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

                }
            );

        }
    );

}


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


            clienteBuscador.value =
                "";


            clienteInput.value =
                "";


            listaClientes.innerHTML =
                "";

        }

    }
);


/*
************************************************************
* CLICK FUERA DE BUSCADORES
************************************************************
*/

document.addEventListener(
    "click",
    event => {

        document
            .querySelectorAll(
                ".listaProductos"
            )
            .forEach(
                lista => {

                    const buscador =
                        lista.parentElement
                            ?.querySelector(
                                ".productoBuscador"
                            );


                    if (
                        buscador &&
                        !buscador.contains(
                            event.target
                        ) &&
                        !lista.contains(
                            event.target
                        )
                    ) {

                        lista.innerHTML =
                            "";

                    }

                }
            );


        if (
            clienteBuscador &&
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
        )
        .padStart(
            2,
            "0"
        );


    const dia =
        String(
            hoy.getDate()
        )
        .padStart(
            2,
            "0"
        );


    fechaInput.value =
        `${año}-${mes}-${dia}`;

}


/*
/*
************************************************************
* RESUMEN
************************************************************
*/

function actualizarResumen() {

    if (!listaResumenEgreso) {
        return;
    }

    listaResumenEgreso.innerHTML = "";

    const articulos = obtenerArticulos();

    let hayDatos = false;

    articulos.forEach((articulo) => {

        const buscador =
            articulo.querySelector(".productoBuscador");

        const lote =
            articulo.querySelector(".lote");

        const cantidad =
            articulo.querySelector(".cantidad");

        const observacion =
            articulo.querySelector(".observacion");

        const producto =
            buscador?.value.trim() || "";

        const loteTexto =
            lote?.options[
                lote.selectedIndex
            ]?.textContent || "";

        const cantidadTexto =
            cantidad?.value || "";

        const observacionTexto =
            observacion?.value.trim() || "";

        if (
            producto ||
            loteTexto ||
            cantidadTexto ||
            observacionTexto
        ) {

            hayDatos = true;

            const fila =
                document.createElement("div");

            fila.className =
                "item-resumen-egreso";

            fila.innerHTML = `

                <div class="resumen-producto">

                    <strong>
                        ${escaparHTML(
                            producto || "Producto"
                        )}
                    </strong>

                </div>


                <div class="resumen-cantidad">

                    ${
                        cantidadTexto
                            ? escaparHTML(cantidadTexto)
                            : ""
                    }

                </div>


                <div class="resumen-lote">

                    ${
                        loteTexto
                            ? escaparHTML(loteTexto)
                            : ""
                    }

                </div>


                <div class="resumen-observacion">

                    ${
                        observacionTexto
                            ? escaparHTML(observacionTexto)
                            : ""
                    }

                </div>

            `;

            listaResumenEgreso.appendChild(fila);

        }

    });


    if (!hayDatos) {

        listaResumenEgreso.innerHTML = `
            <p>
                Completá los productos para ver el resumen.
            </p>
        `;

    }

}
************************************************************
* ESCAPAR HTML
************************************************************
*/

function escaparHTML(
    texto
) {

    return String(
        texto || ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/*
************************************************************
* OBTENER DATOS DE LOS ARTÍCULOS
************************************************************
*/

function obtenerDatosArticulos() {

    const articulos =
        obtenerArticulos();


    const datos =
        [];


    articulos.forEach(
        articulo => {

            const productoInput =
                articulo.querySelector(
                    ".producto"
                );


            const buscador =
                articulo.querySelector(
                    ".productoBuscador"
                );


            const ubicacion =
                articulo.querySelector(
                    ".ubicacion"
                );


            const lote =
                articulo.querySelector(
                    ".lote"
                );


            const cantidad =
                articulo.querySelector(
                    ".cantidad"
                );


            const observacion =
                articulo.querySelector(
                    ".observacion"
                );


            const productoId =
                productoInput?.value ||
                "";


            const stockId =
                lote?.value ||
                "";


            const cantidadRetirar =
                Number(
                    cantidad?.value ||
                    0
                );


            const stockItem =
                stock.find(
                    item =>
                        item.id ===
                        stockId
                );


            const producto =
                productos.find(
                    item =>
                        item.id ===
                        productoId
                );


            datos.push({

                productoId:

                    productoId,

                productoNombre:

                    obtenerNombreProducto(
                        producto || {}
                    ) ||
                    buscador?.value ||
                    "",

                stockId:

                    stockId,

                lote:

                    stockItem?.lote ||
                    "",

                ubicacionId:

                    stockItem?.ubicacionId ||
                    ubicacion?.value ||
                    "",

                ubicacionNombre:

                    stockItem?.ubicacionNombre ||
                    ubicacion?.options[
                        ubicacion.selectedIndex
                    ]?.textContent ||
                    "",

                cantidad:

                    cantidadRetirar,

                unidad:

                    stockItem?.unidad ||
                    producto?.unidad ||
                    "",

                observacion:

                    observacion?.value.trim() ||
                    "",

                stockAnterior:

                    Number(
                        stockItem?.cantidad ||
                        0
                    )

            });

        }
    );


    return datos;

}


/*
************************************************************
* VALIDAR ARTÍCULOS
************************************************************
*/

function validarArticulos(
    datos
) {

    if (
        datos.length === 0
    ) {

        alert(
            "Agregá al menos un producto."
        );

        return false;

    }


    const lotesUsados =
        new Set();


    for (
        const articulo of datos
    ) {

        if (
            !articulo.productoId
        ) {

            alert(
                "Seleccioná un producto en todos los artículos."
            );

            return false;

        }


        if (
            !articulo.stockId
        ) {

            alert(
                "Seleccioná un lote en todos los artículos."
            );

            return false;

        }


        if (
            !articulo.cantidad ||
            articulo.cantidad <= 0
        ) {

            alert(
                "Ingresá una cantidad válida en todos los artículos."
            );

            return false;

        }


        if (
            lotesUsados.has(
                articulo.stockId
            )
        ) {

            alert(
                "No podés utilizar dos veces el mismo lote en una misma entrega."
            );

            return false;

        }


        lotesUsados.add(
            articulo.stockId
        );


        if (
            articulo.cantidad >
            articulo.stockAnterior
        ) {

            alert(

                `No podés retirar ${articulo.cantidad} ${articulo.unidad} ` +

                `del lote ${articulo.lote}. ` +

                `La cantidad disponible es ` +

                `${articulo.stockAnterior} ${articulo.unidad}.`

            );

            return false;

        }

    }


    return true;

}


/*
************************************************************
* REGISTRAR EGRESO
************************************************************
*/

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        try {

            /*
            ==================================================
            CLIENTE
            ==================================================
            */

            let clienteId =
                "";


            let clienteNombre =
                "";


            if (
                tipoEgreso.value ===
                "venta"
            ) {

                clienteId =
                    clienteInput.value;


                clienteNombre =
                    clienteBuscador.value.trim();


                if (
                    !clienteId
                ) {

                    alert(
                        "Seleccioná un cliente."
                    );

                    return;

                }

            }


            /*
            ==================================================
            DATOS ARTÍCULOS
            ==================================================
            */

            const datosArticulos =
                obtenerDatosArticulos();


            if (
                !validarArticulos(
                    datosArticulos
                )
            ) {

                return;

            }


            /*
            ==================================================
            FECHA
            ==================================================
            */

            const fecha =
                fechaInput.value;


            if (
                !fecha
            ) {

                alert(
                    "Seleccioná una fecha."
                );

                return;

            }


            /*
            ==================================================
            CONFIRMACIÓN
            ==================================================
            */

            let mensaje =
                "¿Registrar este egreso?\n\n";


            datosArticulos.forEach(
                (
                    articulo,
                    indice
                ) => {

                    mensaje +=

                        `${indice + 1}. ` +

                        `${articulo.productoNombre}\n` +

                        `   Lote: ${articulo.lote}\n` +

                        `   Ubicación: ${articulo.ubicacionNombre}\n` +

                        `   Cantidad: ${articulo.cantidad} ${articulo.unidad}\n\n`;

                }
            );


            if (
                tipoEgreso.value ===
                "venta"
            ) {

                mensaje +=
                    `Cliente: ${clienteNombre}\n`;

            }


            const confirmar =
                confirm(
                    mensaje
                );


            if (
                !confirmar
            ) {

                return;

            }


            /*
            ==================================================
            BATCH FIRESTORE
            ==================================================
            */

            const batch =
                writeBatch(db);


            const egresosGenerados =
                [];


            /*
            ==================================================
            ACTUALIZAR STOCK
            Y CREAR EGRESOS
            ==================================================
            */

            datosArticulos.forEach(
                articulo => {

                    const nuevaCantidad =

                        articulo.stockAnterior -

                        articulo.cantidad;


                    /*
                    ------------------------------
                    ACTUALIZAR STOCK
                    ------------------------------
                    */

                    const stockRef =
                        doc(
                            db,
                            "stock",
                            articulo.stockId
                        );


                    batch.update(
                        stockRef,
                        {

                            cantidad:
                                nuevaCantidad

                        }
                    );


                    /*
                    ------------------------------
                    CREAR EGRESO
                    ------------------------------
                    */

                    const egresoRef =
                        doc(
                            collection(
                                db,
                                "egresos"
                            )
                        );


                    const observacionArticulo =
                        articulo.observacion;


                    batch.set(
                        egresoRef,
                        {

                            tipoEgreso:
                                tipoEgreso.value,

                            productoId:
                                articulo.productoId,

                            productoNombre:
                                articulo.productoNombre,

                            lote:
                                articulo.lote,

                            ubicacionId:
                                articulo.ubicacionId,

                            ubicacionNombre:
                                articulo.ubicacionNombre,

                            cantidad:
                                articulo.cantidad,

                            unidad:
                                articulo.unidad,

                            clienteId:
                                clienteId,

                            clienteNombre:
                                clienteNombre,

                            fecha:
                                fecha,

                            observacion:
                                observacionArticulo,

                            stockAnterior:
                                articulo.stockAnterior,

                            stockPosterior:
                                nuevaCantidad,

                            creadoEn:
                                serverTimestamp()

                        }
                    );


                    egresosGenerados.push({

                        egresoId:
                            egresoRef.id,

                        productoNombre:
                            articulo.productoNombre,

                        cantidad:
                            articulo.cantidad,

                        unidad:
                            articulo.unidad,

                        lote:
                            articulo.lote,

                        ubicacionNombre:
                            articulo.ubicacionNombre,

                        observacion:
                            observacionArticulo

                    });

                }
            );


            /*
            ==================================================
            HISTORIAL CLIENTE
            SOLO VENTAS
            ==================================================
            */

            if (
                tipoEgreso.value ===
                "venta"

                &&

                clienteId
            ) {

                const visitaRef =
                    doc(
                        collection(
                            db,
                            "visitas"
                        )
                    );


                batch.set(
                    visitaRef,
                    {

                        clienteId:
                            clienteId,

                        clienteNombre:
                            clienteNombre,

                        tipoVisita:
                            "Venta",

                        fecha:
                            fecha,

                        productos:
                            egresosGenerados
                                .map(
                                    articulo => ({

                                        nombre:
                                            articulo.productoNombre,

                                        cantidad:
                                            articulo.cantidad,

                                        unidad:
                                            articulo.unidad,

                                        lote:
                                            articulo.lote,

                                        ubicacionNombre:
                                            articulo.ubicacionNombre,

                                        observacion:
                                            articulo.observacion

                                    })
                                ),

                        observacion:
                            egresosGenerados
                                .map(
                                    articulo =>
                                        articulo.observacion
                                )
                                .filter(
                                    texto =>
                                        texto
                                )
                                .join(
                                    " | "
                                ),

                        egresoId:
                            egresosGenerados
                                .map(
                                    articulo =>
                                        articulo.egresoId
                                ),

                        creadoEn:
                            serverTimestamp()

                    }
                );

            }


            /*
            ==================================================
            GUARDAR TODO
            ==================================================
            */

            await batch.commit();


            /*
            ==================================================
            MENSAJE
            ==================================================
            */

            alert(

                "✅ Egreso registrado correctamente."

                +

                (

                    tipoEgreso.value ===
                    "venta"

                        ?

                    "\n\nLa venta también fue agregada al historial del cliente."

                        :

                    ""

                )

            );


            /*
            ==================================================
            VOLVER AL STOCK
            ==================================================
            */

            window.location.href =
                "stock.html";


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


/*
************************************************************
* AGREGAR ARTÍCULO
************************************************************
*/

if (
    btnAgregarArticulo
) {

    btnAgregarArticulo.addEventListener(
        "click",
        () => {

            crearArticulo();

        }
    );

}


/*
************************************************************
* INICIAR
************************************************************
*/

async function iniciar() {

    colocarFechaActual();


    /*
    * Cliente oculto inicialmente
    */

    contenedorCliente.style.display =
        "none";


    /*
    * Configurar cliente
    */

    configurarCliente();


    /*
    * Configurar artículo inicial
    */

    const articuloInicial =
        document.querySelector(
            ".articulo-egreso"
        );


    if (
        articuloInicial
    ) {

        configurarArticulo(
            articuloInicial
        );

    }


    /*
    * Cargar información
    */

    await Promise.all([

        cargarProductos(),

        cargarStock(),

        cargarClientes()

    ]);


    /*
    * Resumen inicial
    */

    actualizarResumen();

}


iniciar();
