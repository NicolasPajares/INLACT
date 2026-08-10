/*
============================================================
FIREBASE
============================================================
*/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    doc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/*
============================================================
CONFIG FIREBASE
============================================================
*/

const firebaseConfig = {

    apiKey:
        "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",

    authDomain:
        "inlact.firebaseapp.com",

    projectId:
        "inlact",

    storageBucket:
        "inlact.appspot.com",

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
============================================================
ELEMENTOS
============================================================
*/

const productoBuscador =
    document.getElementById(
        "productoBuscador"
    );

const productoInput =
    document.getElementById(
        "producto"
    );

const listaProductos =
    document.getElementById(
        "listaProductos"
    );

const loteSelect =
    document.getElementById(
        "lote"
    );

const ubicacionOrigen =
    document.getElementById(
        "ubicacionOrigen"
    );

const ubicacionDestino =
    document.getElementById(
        "ubicacionDestino"
    );

const cantidadDisponible =
    document.getElementById(
        "cantidadDisponible"
    );

const cantidadInput =
    document.getElementById(
        "cantidad"
    );

const observacionInput =
    document.getElementById(
        "observacion"
    );

const btnTransferir =
    document.getElementById(
        "btnTransferir"
    );


/*
============================================================
VARIABLES
============================================================
*/

let stock = [];

let productos = [];

let ubicaciones = [];

let productoSeleccionado = null;

let stockOrigenSeleccionado = null;


/*
============================================================
CARGAR STOCK
============================================================
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


                /*
                 * Solo stock disponible
                 */

                if (
                    cantidad <= 0
                ) {

                    return;

                }


                stock.push({

                    id:
                        docSnap.id,

                    productoId:
                        datos.productoId ||
                        "",

                    productoNombre:
                        datos.productoNombre ||
                        "Producto sin nombre",

                    lote:
                        datos.lote ||
                        "",

                    ubicacionId:
                        datos.ubicacionId ||
                        datos.ubicacionID ||
                        "",

                    ubicacionNombre:
                        datos.ubicacionNombre ||
                        "Ubicación sin nombre",

                    cantidad:
                        cantidad,

                    unidad:
                        datos.unidad ||
                        "",

                    observacion:
                        datos.observacion ||
                        ""

                });

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
============================================================
CARGAR UBICACIONES
============================================================
*/

async function cargarUbicaciones() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "ubicaciones"
                )
            );


        ubicaciones = [];


        snapshot.forEach(
            docSnap => {

                const datos =
                    docSnap.data();


                ubicaciones.push({

                    id:
                        docSnap.id,

                    nombre:
                        datos.nombre ||
                        datos.descripcion ||
                        "Ubicación sin nombre"

                });

            }
        );


        ubicaciones.sort(
            (a, b) =>
                a.nombre.localeCompare(
                    b.nombre
                )
        );


        console.log(
            "Ubicaciones:",
            ubicaciones
        );


    } catch (error) {

        console.error(
            "Error cargando ubicaciones:",
            error
        );

        alert(
            "No se pudieron cargar las ubicaciones."
        );

    }

}


/*
============================================================
CREAR LISTA DE PRODUCTOS
============================================================
*/

function prepararProductos() {

    const mapa =
        new Map();


    stock.forEach(
        item => {

            if (
                !mapa.has(
                    item.productoId
                )
            ) {

                mapa.set(
                    item.productoId,
                    {
                        id:
                            item.productoId,

                        nombre:
                            item.productoNombre
                    }
                );

            }

        }
    );


    productos =
        Array.from(
            mapa.values()
        );


    productos.sort(
        (a, b) =>
            a.nombre.localeCompare(
                b.nombre
            )
    );

}


/*
============================================================
BUSCADOR DE PRODUCTOS
============================================================
*/

productoBuscador.addEventListener(
    "input",
    () => {

        const texto =
            productoBuscador.value
                .toLowerCase()
                .trim();


        productoInput.value =
            "";

        productoSeleccionado =
            null;

        stockOrigenSeleccionado =
            null;


        loteSelect.innerHTML = `
            <option value="">
                Seleccionar lote
            </option>
        `;


        ubicacionOrigen.innerHTML = `
            <option value="">
                Seleccionar ubicación de origen
            </option>
        `;


        ubicacionDestino.innerHTML = `
            <option value="">
                Seleccionar ubicación de destino
            </option>
        `;


        cantidadDisponible.value =
            "";


        listaProductos.innerHTML =
            "";


        if (
            texto === ""
        ) {

            return;

        }


        const resultados =
            productos.filter(
                producto => {

                    const nombre =
                        (
                            producto.nombre ||
                            ""
                        ).toLowerCase();


                    return nombre.includes(
                        texto
                    );

                }
            );


        if (
            resultados.length === 0
        ) {

            listaProductos.innerHTML = `
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
                    producto.nombre;


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


    productoBuscador.value =
        producto.nombre;


    listaProductos.innerHTML =
        "";


    loteSelect.innerHTML = `
        <option value="">
            Seleccionar lote
        </option>
    `;


    ubicacionOrigen.innerHTML = `
        <option value="">
            Seleccionar ubicación de origen
        </option>
    `;


    ubicacionDestino.innerHTML = `
        <option value="">
            Seleccionar ubicación de destino
        </option>
    `;


    cantidadDisponible.value =
        "";


    stockOrigenSeleccionado =
        null;


    /*
     * Buscar lotes del producto
     */

    const stockProducto =
        stock.filter(
            item =>
                item.productoId ===
                producto.id
        );


    /*
     * Crear lista de lotes
     * sin repetir
     */

    const lotes =
        new Map();


    stockProducto.forEach(
        item => {

            if (
                !lotes.has(
                    item.lote
                )
            ) {

                lotes.set(
                    item.lote,
                    item
                );

            }

        }
    );


    lotes.forEach(
        (item, lote) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                lote;


            option.textContent =
                lote ||
                "Sin lote";


            loteSelect.appendChild(
                option
            );

        }
    );

}


/*
============================================================
CAMBIO DE LOTE
============================================================
*/

loteSelect.addEventListener(
    "change",
    () => {

        const lote =
            loteSelect.value;


        ubicacionOrigen.innerHTML = `
            <option value="">
                Seleccionar ubicación de origen
            </option>
        `;


        ubicacionDestino.innerHTML = `
            <option value="">
                Seleccionar ubicación de destino
            </option>
        `;


        cantidadDisponible.value =
            "";


        stockOrigenSeleccionado =
            null;


        if (
            !productoSeleccionado ||
            !lote
        ) {

            return;

        }


        /*
         * Stock disponible del producto
         * y lote seleccionado
         */

        const existencias =
            stock.filter(
                item =>

                    item.productoId ===
                        productoSeleccionado.id

                    &&

                    item.lote ===
                        lote

                    &&

                    Number(
                        item.cantidad
                    ) > 0
            );


        /*
         * Ubicaciones de origen
         */

        existencias.forEach(
            item => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.id;


                option.textContent =
                    `${item.ubicacionNombre} · ${item.cantidad} ${item.unidad}`;


                ubicacionOrigen.appendChild(
                    option
                );

            }
        );


        /*
         * Destinos:
         *
         * todas las ubicaciones
         * excepto la de origen.
         */

        cargarDestinos();

    }
);


/*
============================================================
CAMBIAR ORIGEN
============================================================
*/

ubicacionOrigen.addEventListener(
    "change",
    () => {

        const stockId =
            ubicacionOrigen.value;


        stockOrigenSeleccionado =
            stock.find(
                item =>
                    item.id ===
                    stockId
            );


        cantidadDisponible.value =
            "";


        if (
            !stockOrigenSeleccionado
        ) {

            cargarDestinos();

            return;

        }


        cantidadDisponible.value =
            `${stockOrigenSeleccionado.cantidad} ${stockOrigenSeleccionado.unidad}`;


        /*
         * Cargar destinos
         */

        cargarDestinos();

    }
);


/*
============================================================
CARGAR DESTINOS
============================================================
*/

function cargarDestinos() {

    ubicacionDestino.innerHTML = `
        <option value="">
            Seleccionar ubicación de destino
        </option>
    `;


    const origenId =
        stockOrigenSeleccionado
            ?.ubicacionId || "";


    ubicaciones.forEach(
        ubicacion => {

            /*
             * No permitir transferir
             * a la misma ubicación
             */

            if (
                ubicacion.id ===
                origenId
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                ubicacion.id;


            option.textContent =
                ubicacion.nombre;


            ubicacionDestino.appendChild(
                option
            );

        }
    );

}


/*
============================================================
TRANSFERIR STOCK
============================================================
*/

btnTransferir.addEventListener(
    "click",
    async () => {

        try {

            /*
             * VALIDACIONES
             */

            if (
                !productoSeleccionado
            ) {

                alert(
                    "Seleccioná un producto."
                );

                return;

            }


            if (
                !loteSelect.value
            ) {

                alert(
                    "Seleccioná un lote."
                );

                return;

            }


            if (
                !stockOrigenSeleccionado
            ) {

                alert(
                    "Seleccioná la ubicación de origen."
                );

                return;

            }


            const destinoId =
                ubicacionDestino.value;


            if (
                !destinoId
            ) {

                alert(
                    "Seleccioná la ubicación de destino."
                );

                return;

            }


            if (
                destinoId ===
                stockOrigenSeleccionado.ubicacionId
            ) {

                alert(
                    "La ubicación de destino debe ser diferente a la de origen."
                );

                return;

            }


            const cantidad =
                Number(
                    cantidadInput.value
                );


            if (
                !cantidad ||
                cantidad <= 0
            ) {

                alert(
                    "Ingresá una cantidad válida."
                );

                return;

            }


            const disponible =
                Number(
                    stockOrigenSeleccionado.cantidad
                );


            if (
                cantidad >
                disponible
            ) {

                alert(
                    `No podés transferir ${cantidad} ${stockOrigenSeleccionado.unidad}. ` +
                    `Solo hay ${disponible} ${stockOrigenSeleccionado.unidad} disponibles.`
                );

                return;

            }


            const destino =
                ubicaciones.find(
                    ubicacion =>
                        ubicacion.id ===
                        destinoId
                );


            if (
                !destino
            ) {

                alert(
                    "No se encontró la ubicación de destino."
                );

                return;

            }


            const confirmar =
                confirm(

                    `¿Confirmar transferencia?\n\n` +

                    `Producto: ${stockOrigenSeleccionado.productoNombre}\n` +

                    `Lote: ${stockOrigenSeleccionado.lote}\n\n` +

                    `Origen: ${stockOrigenSeleccionado.ubicacionNombre}\n` +

                    `Destino: ${destino.nombre}\n\n` +

                    `Cantidad: ${cantidad} ${stockOrigenSeleccionado.unidad}`

                );


            if (
                !confirmar
            ) {

                return;

            }


            /*
             * REFERENCIA STOCK ORIGEN
             */

            const origenRef =
                doc(
                    db,
                    "stock",
                    stockOrigenSeleccionado.id
                );


            /*
             * BUSCAR STOCK EXISTENTE
             * EN DESTINO
             */

            const qDestino =
                query(

                    collection(
                        db,
                        "stock"
                    ),

                    where(
                        "productoId",
                        "==",
                        stockOrigenSeleccionado.productoId
                    ),

                    where(
                        "lote",
                        "==",
                        stockOrigenSeleccionado.lote
                    ),

                    where(
                        "ubicacionId",
                        "==",
                        destinoId
                    )

                );


            const snapDestino =
                await getDocs(
                    qDestino
                );


            let destinoDoc = null;


            snapDestino.forEach(
                docSnap => {

                    /*
                     * Solo utilizamos un registro
                     * de destino con cantidad.
                     */

                    if (
                        destinoDoc ===
                        null
                    ) {

                        destinoDoc =
                            docSnap;

                    }

                }
            );


            /*
             * OBSERVACIÓN
             */

            const observacion =
                observacionInput.value
                    .trim();


            /*
             * TRANSACCIÓN
             */

            await runTransaction(
                db,
                async transaction => {

                    /*
                     * Leer origen
                     */

                    const origenSnap =
                        await transaction.get(
                            origenRef
                        );


                    if (
                        !origenSnap.exists()
                    ) {

                        throw new Error(
                            "El stock de origen ya no existe."
                        );

                    }


                    const origenData =
                        origenSnap.data();


                    const cantidadOrigen =
                        Number(
                            origenData.cantidad ||
                            0
                        );


                    /*
                     * Verificar nuevamente
                     * el stock disponible
                     */

                    if (
                        cantidad >
                        cantidadOrigen
                    ) {

                        throw new Error(
                            "La cantidad disponible cambió. Actualizá la página e intentá nuevamente."
                        );

                    }


                    /*
                     * NUEVA CANTIDAD ORIGEN
                     */

                    const nuevaCantidadOrigen =
                        cantidadOrigen -
                        cantidad;


                    /*
                     * DESCONTAR ORIGEN
                     */

                    transaction.update(
                        origenRef,
                        {

                            cantidad:
                                nuevaCantidadOrigen,

                            actualizadoEn:
                                serverTimestamp()

                        }
                    );


                    /*
                     * DESTINO EXISTENTE
                     */

                    if (
                        destinoDoc
                    ) {

                        const destinoRef =
                            doc(
                                db,
                                "stock",
                                destinoDoc.id
                            );


                        /*
                         * OJO:
                         *
                         * La lectura del destino
                         * debe hacerse dentro
                         * de la transacción.
                         */

                        const destinoSnap =
                            await transaction.get(
                                destinoRef
                            );


                        if (
                            destinoSnap.exists()
                        ) {

                            const destinoData =
                                destinoSnap.data();


                            const cantidadDestino =
                                Number(
                                    destinoData.cantidad ||
                                    0
                                );


                            transaction.update(
                                destinoRef,
                                {

                                    cantidad:
                                        cantidadDestino +
                                        cantidad,

                                    actualizadoEn:
                                        serverTimestamp(),

                                    observacion:
                                        observacion ||
                                        destinoData.observacion ||
                                        ""

                                }
                            );

                        }

                    }

                    /*
                     * DESTINO NUEVO
                     */

                    else {

                        const nuevoDestinoRef =
                            doc(
                                collection(
                                    db,
                                    "stock"
                                )
                            );


                        transaction.set(
                            nuevoDestinoRef,
                            {

                                productoId:
                                    stockOrigenSeleccionado.productoId,

                                productoNombre:
                                    stockOrigenSeleccionado.productoNombre,

                                lote:
                                    stockOrigenSeleccionado.lote,

                                ubicacionId:
                                    destinoId,

                                ubicacionNombre:
                                    destino.nombre,

                                cantidad:
                                    cantidad,

                                unidad:
                                    stockOrigenSeleccionado.unidad,

                                observacion:
                                    observacion,

                                creadoEn:
                                    serverTimestamp(),

                                actualizadoEn:
                                    serverTimestamp()

                            }
                        );

                    }

                }
            );


            /*
             * ÉXITO
             */

            alert(
                "✅ Transferencia realizada correctamente."
            );


            /*
             * VOLVER A STOCK
             */

            window.location.href =
                "stock.html";


        } catch (error) {

            console.error(
                "ERROR EN TRANSFERENCIA:",
                error
            );


            alert(
                "❌ No se pudo realizar la transferencia.\n\n" +
                error.message
            );

        }

    }
);


/*
============================================================
CLICK FUERA DEL BUSCADOR
============================================================
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

    }
);


/*
============================================================
INICIAR
============================================================
*/

async function iniciar() {

    await cargarStock();

    await cargarUbicaciones();

    prepararProductos();

}


iniciar();
