/************************************************************
 * FIREBASE
 ************************************************************/

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/************************************************************
 * CONFIG FIREBASE
 ************************************************************/

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


/************************************************************
 * ELEMENTOS
 ************************************************************/

const form =
    document.getElementById("formIngresoStock");

const productoBuscador =
    document.getElementById("productoBuscador");

const listaProductos =
    document.getElementById("listaProductos");

const productoIdInput =
    document.getElementById("producto");

const loteInput =
    document.getElementById("lote");

const ubicacionSelect =
    document.getElementById("ubicacion");

const cantidadInput =
    document.getElementById("cantidad");

const unidadSelect =
    document.getElementById("unidad");

const fechaInput =
    document.getElementById("fecha");

const observacionInput =
    document.getElementById("observacion");


/************************************************************
 * VARIABLES
 ************************************************************/

let productos = [];

let ubicaciones = [];

let productoSeleccionado = null;


/************************************************************
 * CARGAR PRODUCTOS
 ************************************************************/

async function cargarProductos() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "productos")
            );


        productos = [];


        snapshot.forEach(docSnap => {

            const datos = docSnap.data();


            /*
             * Solo productos activos.
             */

            if (datos.activo !== false) {

                productos.push({

                    id: docSnap.id,

                    ...datos

                });

            }

        });


        /*
         * Orden alfabético
         */

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


/************************************************************
 * CARGAR UBICACIONES
 ************************************************************/

async function cargarUbicaciones() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "ubicaciones")
            );


        ubicaciones = [];


        snapshot.forEach(docSnap => {

            const datos = docSnap.data();


            if (datos.activo !== false) {

                ubicaciones.push({

                    id: docSnap.id,

                    ...datos

                });

            }

        });


        /*
         * Orden alfabético
         */

        ubicaciones.sort((a, b) => {

            return (
                a.nombre || ""
            ).localeCompare(
                b.nombre || ""
            );

        });


        /*
         * Limpiar selector
         */

        ubicacionSelect.innerHTML = `
            <option value="">
                Seleccionar ubicación
            </option>
        `;


        /*
         * Agregar ubicaciones
         */

        ubicaciones.forEach(ubicacion => {

            const option =
                document.createElement("option");


            option.value =
                ubicacion.id;


            option.textContent =
                ubicacion.nombre;


            ubicacionSelect.appendChild(
                option
            );

        });


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


/************************************************************
 * BUSCAR PRODUCTOS
 ************************************************************/

productoBuscador.addEventListener(
    "input",
    () => {

        const texto =
            productoBuscador.value
            .toLowerCase()
            .trim();


        /*
         * Cada vez que el usuario modifica
         * el texto, obligamos a seleccionar
         * nuevamente un producto.
         */

        productoIdInput.value = "";

        productoSeleccionado = null;


        listaProductos.innerHTML = "";


        /*
         * Si no escribió nada,
         * no mostramos resultados.
         */

        if (texto === "") {

            return;

        }


        /*
         * Buscar coincidencias
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


        /*
         * Si no encuentra nada
         */

        if (resultados.length === 0) {

            listaProductos.innerHTML = `
                <div>
                    No se encontraron productos.
                </div>
            `;

            return;

        }


        /*
         * Mostrar resultados
         */

        resultados.forEach(producto => {

            const opcion =
                document.createElement("div");


            opcion.textContent =
                producto.descripcion ||
                producto.nombre ||
                "Producto sin nombre";


            /*
             * Si tiene código,
             * también lo mostramos.
             */

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


            /*
             * Seleccionar producto
             */

            opcion.addEventListener(
                "click",
                () => {

                    productoSeleccionado =
                        producto;


                    productoIdInput.value =
                        producto.id;


                    productoBuscador.value =
                        producto.descripcion ||
                        producto.nombre ||
                        "";


                    listaProductos.innerHTML =
                        "";


                    /*
                     * Si el producto tiene
                     * unidad definida,
                     * podemos sugerirla.
                     */

                    if (
                        producto.unidad &&
                        unidadSelect
                    ) {

                        const unidadExiste =
                            Array.from(
                                unidadSelect.options
                            ).some(
                                option =>
                                    option.value ===
                                    producto.unidad
                            );


                        if (unidadExiste) {

                            unidadSelect.value =
                                producto.unidad;

                        }

                    }

                }
            );


            listaProductos.appendChild(
                opcion
            );

        });

    }
);


/************************************************************
 * CLICK FUERA DEL BUSCADOR
 ************************************************************/

document.addEventListener(
    "click",
    (event) => {

        if (
            !productoBuscador.contains(event.target) &&
            !listaProductos.contains(event.target)
        ) {

            listaProductos.innerHTML = "";

        }

    }
);


/************************************************************
 * GUARDAR INGRESO
 ************************************************************/

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        /*
         * Verificar producto
         */

        if (
            !productoSeleccionado ||
            !productoIdInput.value
        ) {

            alert(
                "Seleccioná un producto de la lista."
            );

            productoBuscador.focus();

            return;

        }


        /*
         * Obtener datos
         */

        const productoId =
            productoSeleccionado.id;


        const productoNombre =
            productoSeleccionado.descripcion ||
            productoSeleccionado.nombre ||
            "Producto sin nombre";


        const lote =
            loteInput.value.trim();


        const ubicacionId =
            ubicacionSelect.value;


        if (!ubicacionId) {

            alert(
                "Seleccioná una ubicación."
            );

            return;

        }


        const ubicacionSeleccionada =
            ubicaciones.find(
                ubicacion =>
                    ubicacion.id ===
                    ubicacionId
            );


        const ubicacionNombre =
            ubicacionSeleccionada?.nombre ||
            "Ubicación sin nombre";


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

            cantidadInput.focus();

            return;

        }


        const unidad =
            unidadSelect.value;


        if (!unidad) {

            alert(
                "Seleccioná una unidad."
            );

            return;

        }


        const fecha =
            fechaInput.value;


        const observacion =
            observacionInput.value.trim();


        try {

            /*
             * ==================================================
             * 1. BUSCAR SI YA EXISTE EL MISMO STOCK
             * ==================================================
             *
             * Mismo:
             *
             * producto
             * lote
             * ubicación
             * unidad
             *
             * Si existe:
             * SUMAMOS la cantidad.
             *
             * Si no existe:
             * CREAMOS un nuevo registro.
             */

            const stockSnapshot =
                await getDocs(
                    collection(db, "stock")
                );


            let stockExistente = null;


            stockSnapshot.forEach(
                docSnap => {

                    const datos =
                        docSnap.data();


                    const mismoProducto =
                        datos.productoId ===
                        productoId;


                    const mismoLote =
                        (
                            datos.lote ||
                            ""
                        ).trim()
                        .toLowerCase() ===
                        lote.toLowerCase();


                    const mismoUbicacion =
                        (
                            datos.ubicacionId ||
                            datos.ubicacionID ||
                            ""
                        ) ===
                        ubicacionId;


                    const mismaUnidad =
                        (
                            datos.unidad ||
                            ""
                        ).toLowerCase() ===
                        unidad.toLowerCase();


                    if (
                        mismoProducto &&
                        mismoLote &&
                        mismoUbicacion &&
                        mismaUnidad
                    ) {

                        stockExistente = {

                            id:
                                docSnap.id,

                            ...datos

                        };

                    }

                }
            );


            /*
             * ==================================================
             * 2. ACTUALIZAR O CREAR STOCK
             * ==================================================
             */

            if (stockExistente) {

                /*
                 * Ya existe.
                 *
                 * Sumamos la cantidad nueva.
                 */

                const cantidadAnterior =
                    Number(
                        stockExistente.cantidad ||
                        0
                    );


                const nuevaCantidad =
                    cantidadAnterior +
                    cantidad;


                await updateDoc(
                    doc(
                        db,
                        "stock",
                        stockExistente.id
                    ),
                    {

                        cantidad:
                            nuevaCantidad,

                        fechaActualizacion:
                            serverTimestamp()

                    }
                );


            } else {

                /*
                 * No existe.
                 *
                 * Creamos nuevo registro.
                 */

                await addDoc(
                    collection(db, "stock"),
                    {

                        productoId:
                            productoId,

                        productoNombre:
                            productoNombre,

                        lote:
                            lote,

                        ubicacionId:
                            ubicacionId,

                        ubicacionNombre:
                            ubicacionNombre,

                        cantidad:
                            cantidad,

                        unidad:
                            unidad,

                        fechaIngreso:
                            fecha,

                        observacion:
                            observacion,

                        activo:
                            true,

                        fechaCreacion:
                            serverTimestamp()

                    }
                );

            }


            /*
             * ==================================================
             * 3. REGISTRAR MOVIMIENTO
             * ==================================================
             *
             * Esto deja el historial del ingreso.
             */

            await addDoc(
                collection(db, "movimientos_stock"),
                {

                    tipo:
                        "ingreso",

                    productoId:
                        productoId,

                    productoNombre:
                        productoNombre,

                    lote:
                        lote,

                    ubicacionDestinoId:
                        ubicacionId,

                    ubicacionDestinoNombre:
                        ubicacionNombre,

                    cantidad:
                        cantidad,

                    unidad:
                        unidad,

                    fecha:
                        fecha,

                    observacion:
                        observacion,

                    fechaRegistro:
                        serverTimestamp()

                }
            );


            /*
             * ==================================================
             * 4. CONFIRMACIÓN
             * ==================================================
             */

            alert(
                "Ingreso de stock registrado correctamente."
            );


            /*
             * Limpiar formulario
             */

            form.reset();

            productoIdInput.value = "";

            productoSeleccionado = null;

            listaProductos.innerHTML = "";


            /*
             * Volver al stock
             */

            window.location.href =
                "stock.html";


        } catch (error) {

            console.error(
                "Error registrando ingreso:",
                error
            );


            alert(
                "No se pudo registrar el ingreso. Revisá la consola."
            );

        }

    }
);


/************************************************************
 * FECHA ACTUAL
 ************************************************************/

function colocarFechaActual() {

    const hoy =
        new Date();


    const año =
        hoy.getFullYear();


    const mes =
        String(
            hoy.getMonth() + 1
        )
        .padStart(2, "0");


    const dia =
        String(
            hoy.getDate()
        )
        .padStart(2, "0");


    fechaInput.value =
        `${año}-${mes}-${dia}`;

}


/************************************************************
 * INICIAR
 ************************************************************/

async function iniciar() {

    colocarFechaActual();

    await Promise.all([

        cargarProductos(),

        cargarUbicaciones()

    ]);

}


iniciar();
