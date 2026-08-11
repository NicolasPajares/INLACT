/* ============================================================
   NUEVA LISTA DE PRECIOS
============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ============================================================
   FIREBASE
============================================================ */

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


/* ============================================================
   ELEMENTOS
============================================================ */

const form =
    document.getElementById(
        "formNuevaLista"
    );


const nombreLista =
    document.getElementById(
        "nombreLista"
    );


const fecha =
    document.getElementById(
        "fecha"
    );


const btnAgregarProducto =
    document.getElementById(
        "btnAgregarProducto"
    );


const listaProductos =
    document.getElementById(
        "listaProductos"
    );


/* ============================================================
   VARIABLES
============================================================ */

let productos = [];

let productosAgregados = [];


/* ============================================================
   CARGAR PRODUCTOS
============================================================ */

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

                const p =
                    docSnap.data();


                /*
                 * Solo productos activos
                 */

                if (
                    p.activo === false
                ) {

                    return;

                }


                productos.push({

                    id:
                        docSnap.id,

                    codigo:
                        p.codigo ||
                        "",

                    descripcion:
                        p.descripcion ||
                        "Producto sin nombre",

                    unidad:
                        p.unidad ||
                        ""

                });

            }
        );


        /*
         * Ordenar alfabéticamente
         */

        productos.sort(
            (a, b) =>
                a.descripcion.localeCompare(
                    b.descripcion,
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                )
        );


        console.log(
            "Productos cargados:",
            productos.length
        );

    }

    catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );


        alert(
            "No se pudieron cargar los productos."
        );

    }

}


/* ============================================================
   CREAR SELECTOR DE PRODUCTOS
============================================================ */

function crearBuscadorProducto(
    contenedor,
    productoSeleccionado
) {

    /*
     * INPUT BUSCADOR
     */

    const buscador =
        document.createElement(
            "input"
        );


    buscador.type =
        "text";


    buscador.placeholder =
        "Buscar producto por nombre o código...";


    buscador.autocomplete =
        "off";


    buscador.className =
        "buscador-producto";


    /*
     * LISTA DE RESULTADOS
     */

    const resultados =
        document.createElement(
            "div"
        );


    resultados.className =
        "resultados-productos";


    resultados.hidden =
        true;


    contenedor.appendChild(
        buscador
    );


    contenedor.appendChild(
        resultados
    );


    /*
     * MOSTRAR PRODUCTO SELECCIONADO
     */

    if (
        productoSeleccionado
    ) {

        buscador.value =
            productoSeleccionado.descripcion;

    }


    /*
     * BUSCAR
     */

    buscador.addEventListener(
        "input",
        () => {

            const texto =
                buscador.value
                    .toLowerCase()
                    .trim();


            resultados.innerHTML =
                "";


            if (
                texto === ""
            ) {

                resultados.hidden =
                    true;

                return;

            }


            /*
             * Filtrar productos
             */

            const encontrados =
                productos.filter(
                    producto => {

                        const nombre =
                            producto.descripcion
                                .toLowerCase();

                        const codigo =
                            producto.codigo
                                .toLowerCase();


                        return (
                            nombre.includes(
                                texto
                            ) ||
                            codigo.includes(
                                texto
                            )
                        );

                    }
                )
                .slice(
                    0,
                    15
                );


            if (
                encontrados.length === 0
            ) {

                resultados.innerHTML = `

                    <div class="sin-resultados">
                        No se encontraron productos.
                    </div>

                `;


                resultados.hidden =
                    false;

                return;

            }


            /*
             * Crear resultados
             */

            encontrados.forEach(
                producto => {

                    const opcion =
                        document.createElement(
                            "div"
                        );


                    opcion.className =
                        "resultado-producto";


                    opcion.innerHTML = `

                        <strong>
                            ${producto.descripcion}
                        </strong>

                        <small>
                            ${
                                producto.codigo
                                    ? `Código: ${producto.codigo}`
                                    : ""
                            }

                            ${
                                producto.unidad
                                    ? ` · ${producto.unidad}`
                                    : ""
                            }
                        </small>

                    `;


                    opcion.addEventListener(
                        "click",
                        () => {

                            seleccionarProducto(
                                producto,
                                buscador,
                                resultados,
                                contenedor
                            );

                        }
                    );


                    resultados.appendChild(
                        opcion
                    );

                }
            );


            resultados.hidden =
                false;

        }
    );


    /*
     * Cerrar resultados
     * cuando se hace click afuera
     */

    document.addEventListener(
        "click",
        event => {

            if (
                !contenedor.contains(
                    event.target
                )
            ) {

                resultados.hidden =
                    true;

            }

        }
    );


    return buscador;

}


/* ============================================================
   SELECCIONAR PRODUCTO
============================================================ */

function seleccionarProducto(
    producto,
    buscador,
    resultados,
    contenedor
) {

    /*
     * Verificar duplicado
     */

    const yaExiste =
        productosAgregados.some(
            p =>
                p.productoId ===
                producto.id
        );


    /*
     * Si ya existe y no pertenece
     * a esta misma fila
     */

    const fila =
        contenedor.closest(
            ".producto-lista"
        );


    const productoDeEstaFila =
        fila &&
        fila.dataset.productoId ===
        producto.id;


    if (
        yaExiste &&
        !productoDeEstaFila
    ) {

        alert(
            "⚠️ Este producto ya está agregado a la lista."
        );


        return;

    }


    buscador.value =
        producto.descripcion;


    resultados.innerHTML =
        "";


    resultados.hidden =
        true;


    /*
     * Guardar producto en la fila
     */

    if (
        fila
    ) {

        fila.dataset.productoId =
            producto.id;


        fila.dataset.descripcion =
            producto.descripcion;


        fila.dataset.codigo =
            producto.codigo;


        fila.dataset.unidad =
            producto.unidad;


        /*
         * Mostrar unidad
         */

        const unidad =
            fila.querySelector(
                ".unidad-producto"
            );


        if (
            unidad
        ) {

            unidad.textContent =
                producto.unidad ||
                "Sin unidad";

        }


        /*
         * Actualizar lista interna
         */

        actualizarProductosAgregados();

    }

}


/* ============================================================
   CREAR FILA PRODUCTO
============================================================ */

function agregarFilaProducto() {

    const fila =
        document.createElement(
            "div"
        );


    fila.className =
        "producto-lista";


    /*
     * CONTENEDOR BUSCADOR
     */

    const contenedorBuscador =
        document.createElement(
            "div"
        );


    contenedorBuscador.className =
        "contenedor-buscador-producto";


    /*
     * BUSCADOR
     */

    crearBuscadorProducto(
        contenedorBuscador
    );


    /*
     * UNIDAD
     */

    const unidad =
        document.createElement(
            "span"
        );


    unidad.className =
        "unidad-producto";


    unidad.textContent =
        "Sin producto";


    /*
     * MONEDA
     */

    const moneda =
        document.createElement(
            "select"
        );


    moneda.className =
        "moneda-producto";


    moneda.innerHTML = `

        <option value="ARS">
            ARS - Pesos
        </option>

        <option value="USD">
            USD - Dólares
        </option>

        <option value="EUR">
            EUR - Euros
        </option>

    `;


    /*
     * PRECIO
     */

    const precio =
        document.createElement(
            "input"
        );


    precio.type =
        "number";


    precio.className =
        "precio-producto";


    precio.min =
        "0";


    precio.step =
        "0.01";


    precio.placeholder =
        "Precio";


    /*
     * BOTÓN ELIMINAR
     */

    const btnEliminar =
        document.createElement(
            "button"
        );


    btnEliminar.type =
        "button";


    btnEliminar.className =
        "btn-eliminar-producto";


    btnEliminar.textContent =
        "🗑️";


    btnEliminar.title =
        "Eliminar producto";


    btnEliminar.addEventListener(
        "click",
        () => {

            fila.remove();

            actualizarProductosAgregados();

        }
    );


    /*
     * ARMAR FILA
     */

    fila.appendChild(
        contenedorBuscador
    );


    fila.appendChild(
        unidad
    );


    fila.appendChild(
        moneda
    );


    fila.appendChild(
        precio
    );


    fila.appendChild(
        btnEliminar
    );


    /*
     * Agregar la fila al contenedor.
     *
     * El botón "Agregar producto"
     * está FUERA de este contenedor
     * en el HTML, por lo tanto queda
     * automáticamente debajo de todas
     * las filas.
     */

    listaProductos.appendChild(
        fila
    );


    /*
     * Actualizar productos
     */

    actualizarProductosAgregados();


    /*
     * Enfocar buscador
     */

    const input =
        fila.querySelector(
            ".buscador-producto"
        );


    if (
        input
    ) {

        input.focus();

    }

}


/* ============================================================
   ACTUALIZAR PRODUCTOS AGREGADOS
============================================================ */

function actualizarProductosAgregados() {

    productosAgregados = [];


    const filas =
        listaProductos.querySelectorAll(
            ".producto-lista"
        );


    filas.forEach(
        fila => {

            const productoId =
                fila.dataset.productoId;


            if (
                !productoId
            ) {

                return;

            }


            const moneda =
                fila.querySelector(
                    ".moneda-producto"
                );


            const precio =
                fila.querySelector(
                    ".precio-producto"
                );


            productosAgregados.push({

                productoId:
                    productoId,

                productoNombre:
                    fila.dataset.descripcion ||
                    "",

                codigo:
                    fila.dataset.codigo ||
                    "",

                unidad:
                    fila.dataset.unidad ||
                    "",

                moneda:
                    moneda
                        ? moneda.value
                        : "ARS",

                precio:
                    precio
                        ? Number(
                            precio.value || 0
                        )
                        : 0

            });

        }
    );

}


/* ============================================================
   AGREGAR PRODUCTO — ÚNICO BOTÓN DEL HTML
============================================================ */

btnAgregarProducto.addEventListener(
    "click",
    () => {

        agregarFilaProducto();

    }
);


/* ============================================================
   GUARDAR LISTA
============================================================ */

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        /*
         * Validar nombre
         */

        const nombre =
            nombreLista.value.trim();


        if (
            !nombre
        ) {

            alert(
                "Ingresá el nombre de la lista."
            );


            nombreLista.focus();


            return;

        }


        /*
         * Validar fecha
         */

        if (
            !fecha.value
        ) {

            alert(
                "Seleccioná una fecha."
            );


            fecha.focus();


            return;

        }


        /*
         * Actualizar productos
         */

        actualizarProductosAgregados();


        /*
         * Verificar que haya productos
         */

        if (
            productosAgregados.length === 0
        ) {

            alert(
                "Agregá al menos un producto a la lista."
            );


            return;

        }


        /*
         * Verificar precios
         */

        const precioInvalido =
            productosAgregados.some(
                producto =>
                    !Number.isFinite(
                        producto.precio
                    ) ||
                    producto.precio <= 0
            );


        if (
            precioInvalido
        ) {

            alert(
                "Todos los productos deben tener un precio mayor a 0."
            );


            return;

        }


        /*
         * Convertir fecha
         *
         * Input date:
         * YYYY-MM-DD
         */

        const partes =
            fecha.value.split("-");


        const año =
            Number(
                partes[0]
            );


        const mes =
            Number(
                partes[1]
            ) - 1;


        const dia =
            Number(
                partes[2]
            );


        const fechaLista =
            new Date(
                año,
                mes,
                dia,
                12,
                0,
                0
            );


        /*
         * Datos a guardar
         */

        const datosLista = {

            nombre:
                nombre,

            fecha:
                Timestamp.fromDate(
                    fechaLista
                ),

            productos:
                productosAgregados,

            creadoEn:
                Timestamp.now()

        };


        /*
         * Evitar doble click
         */

        const botonGuardar =
            form.querySelector(
                ".btn-guardar"
            );


        if (
            botonGuardar
        ) {

            botonGuardar.disabled =
                true;

            botonGuardar.textContent =
                "Guardando...";

        }


        try {

            await addDoc(
                collection(
                    db,
                    "listaprecios"
                ),
                datosLista
            );


            alert(
                "Lista de precios guardada ✔"
            );


            /*
             * Volver al listado
             */

            window.location.href =
                "lista-precios.html";

        }

        catch (error) {

            console.error(
                "Error guardando lista:",
                error
            );


            alert(
                "No se pudo guardar la lista de precios."
            );


            if (
                botonGuardar
            ) {

                botonGuardar.disabled =
                    false;

                botonGuardar.textContent =
                    "💾 Guardar lista de precios";

            }

        }

    }
);


/* ============================================================
   FECHA POR DEFECTO
============================================================ */

function establecerFechaActual() {

    if (
        fecha.value
    ) {

        return;

    }


    const hoy =
        new Date();


    const año =
        hoy.getFullYear();


    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            hoy.getDate()
        ).padStart(
            2,
            "0"
        );


    fecha.value =
        `${año}-${mes}-${dia}`;

}


/* ============================================================
   INICIAR
============================================================ */

async function iniciar() {

    establecerFechaActual();

    await cargarProductos();

}


iniciar();
