/* ============================================================
   NUEVA / EDITAR LISTA DE PRECIOS
============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    doc,
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
   MODO EDICIÓN
============================================================ */

/*
 * Si la página se abre así:
 *
 * nueva-lista-precios.html?id=ABC123
 *
 * estamos editando una lista existente.
 */

const parametros =
    new URLSearchParams(
        window.location.search
    );

const listaId =
    parametros.get("id");

const modoEdicion =
    Boolean(listaId);


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
     * BUSCAR PRODUCTOS
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
                productos
                    .filter(
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
     * Cerrar resultados al hacer click afuera
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


        actualizarProductosAgregados();

    }

}


/* ============================================================
   CREAR FILA PRODUCTO
============================================================ */

function agregarFilaProducto(
    productoInicial = null
) {

    const fila =
        document.createElement(
            "div"
        );


    fila.className =
        "producto-lista";


    /*
     * Si estamos cargando una lista existente,
     * guardar los datos del producto en la fila.
     */

    if (
        productoInicial
    ) {

        fila.dataset.productoId =
            productoInicial.productoId ||
            "";

        fila.dataset.descripcion =
            productoInicial.productoNombre ||
            "";

        fila.dataset.codigo =
            productoInicial.codigo ||
            "";

        fila.dataset.unidad =
            productoInicial.unidad ||
            "";

    }


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
        contenedorBuscador,
        productoInicial
            ? {
                descripcion:
                    productoInicial.productoNombre ||
                    ""
            }
            : null
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
        productoInicial
            ? (
                productoInicial.unidad ||
                "Sin unidad"
            )
            : "Sin producto";


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
     * Recuperar moneda existente
     */

    if (
        productoInicial &&
        productoInicial.moneda
    ) {

        moneda.value =
            productoInicial.moneda;

    }


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
     * Recuperar precio existente
     */

    if (
        productoInicial &&
        productoInicial.precio !== undefined
    ) {

        precio.value =
            productoInicial.precio;

    }


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
     * Agregar al contenedor
     */

    listaProductos.appendChild(
        fila
    );


    /*
     * Actualizar productos
     */

    actualizarProductosAgregados();


    /*
     * Si es una fila nueva,
     * enfocar buscador.
     */

    if (
        !productoInicial
    ) {

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
   AGREGAR PRODUCTO
============================================================ */

btnAgregarProducto.addEventListener(
    "click",
    () => {

        agregarFilaProducto();

    }
);


/* ============================================================
   CARGAR LISTA PARA EDITAR
============================================================ */

async function cargarListaParaEditar() {

    if (
        !modoEdicion
    ) {

        return;

    }


    try {

        const referencia =
            doc(
                db,
                "listaprecios",
                listaId
            );


        const snapshot =
            await getDoc(
                referencia
            );


        if (
            !snapshot.exists()
        ) {

            alert(
                "No se encontró la lista de precios."
            );


            window.location.href =
                "lista-precios.html";


            return;

        }


        const datos =
            snapshot.data();


        /*
         * Nombre
         */

        nombreLista.value =
            datos.nombre ||
            "";


        /*
         * Fecha
         */

        if (
            datos.fecha &&
            typeof datos.fecha.toDate === "function"
        ) {

            const fechaLista =
                datos.fecha.toDate();


            const año =
                fechaLista.getFullYear();


            const mes =
                String(
                    fechaLista.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const dia =
                String(
                    fechaLista.getDate()
                ).padStart(
                    2,
                    "0"
                );


            fecha.value =
                `${año}-${mes}-${dia}`;

        }


        /*
         * Limpiar productos actuales
         */

        listaProductos.innerHTML =
            "";


        /*
         * Cargar productos guardados
         */

        const listaGuardada =
            Array.isArray(
                datos.productos
            )
                ? datos.productos
                : [];


        listaGuardada.forEach(
            producto => {

                agregarFilaProducto(
                    producto
                );

            }
        );


        /*
         * Cambiar texto del botón
         */

        const botonGuardar =
            form.querySelector(
                ".btn-guardar"
            );


        if (
            botonGuardar
        ) {

            botonGuardar.textContent =
                "💾 Actualizar lista de precios";

        }


        /*
         * Cambiar título
         */

        const titulo =
            document.querySelector(
                "h1"
            );


        if (
            titulo
        ) {

            titulo.textContent =
                "Editar lista de precios";

        }


        console.log(
            "Lista cargada para editar:",
            listaId
        );

    }

    catch (error) {

        console.error(
            "Error cargando lista:",
            error
        );


        alert(
            "No se pudo cargar la lista de precios."
        );


        window.location.href =
            "lista-precios.html";

    }

}


/* ============================================================
   GUARDAR / ACTUALIZAR LISTA
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
         * Verificar productos
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
         * Datos de la lista
         */

        const datosLista = {

            nombre:
                nombre,

            fecha:
                Timestamp.fromDate(
                    fechaLista
                ),

            productos:
                productosAgregados

        };


        /*
         * Botón guardar
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
                modoEdicion
                    ? "Actualizando..."
                    : "Guardando...";

        }


        try {

            /*
             * MODO EDICIÓN
             */

            if (
                modoEdicion
            ) {

                await updateDoc(
                    doc(
                        db,
                        "listaprecios",
                        listaId
                    ),
                    {

                        nombre:
                            datosLista.nombre,

                        fecha:
                            datosLista.fecha,

                        productos:
                            datosLista.productos,

                        actualizadoEn:
                            Timestamp.now()

                    }
                );


                alert(
                    "Lista de precios actualizada ✔"
                );

            }

            /*
             * MODO NUEVA LISTA
             */

            else {

                await addDoc(
                    collection(
                        db,
                        "listaprecios"
                    ),
                    {

                        nombre:
                            datosLista.nombre,

                        fecha:
                            datosLista.fecha,

                        productos:
                            datosLista.productos,

                        creadoEn:
                            Timestamp.now()

                    }
                );


                alert(
                    "Lista de precios guardada ✔"
                );

            }


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
                modoEdicion
                    ? "No se pudo actualizar la lista de precios."
                    : "No se pudo guardar la lista de precios."
            );


            if (
                botonGuardar
            ) {

                botonGuardar.disabled =
                    false;

                botonGuardar.textContent =
                    modoEdicion
                        ? "💾 Actualizar lista de precios"
                        : "💾 Guardar lista de precios";

            }

        }

    }
);


/* ============================================================
   FECHA POR DEFECTO
============================================================ */

function establecerFechaActual() {

    /*
     * Si estamos editando, no ponemos
     * la fecha actual porque la lista
     * va a traer su propia fecha.
     */

    if (
        modoEdicion
    ) {

        return;

    }


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

    /*
     * Primero cargamos los productos.
     */

    await cargarProductos();


    /*
     * Si es una nueva lista,
     * poner fecha actual.
     */

    establecerFechaActual();


    /*
     * Si es edición,
     * cargar la lista existente.
     */

    if (
        modoEdicion
    ) {

        await cargarListaParaEditar();

    }

}


iniciar();
