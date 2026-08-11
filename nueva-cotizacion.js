/* ============================================================
   NUEVA COTIZACIÓN
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


/* ============================================================
   ELEMENTOS
============================================================ */

const form =
    document.getElementById(
        "formNuevaCotizacion"
    );

const selectCliente =
    document.getElementById(
        "cliente"
    );

const fechaEl =
    document.getElementById(
        "fecha"
    );

const nombreCotizacionEl =
    document.getElementById(
        "nombreCotizacion"
    );

const propuestaEl =
    document.getElementById(
        "propuesta"
    );

const dosisEl =
    document.getElementById(
        "dosis"
    );

const observacionesEl =
    document.getElementById(
        "observaciones"
    );

const listaProductosEl =
    document.getElementById(
        "listaProductosCotizacion"
    );

const btnAgregarProducto =
    document.getElementById(
        "btnAgregarProductoCotizacion"
    );

const selectListaPrecios =
    document.getElementById(
        "listaPrecios"
    );


/* ============================================================
   VARIABLES
============================================================ */

let productos = [];

let listasPrecios = [];

let listaPreciosSeleccionada = null;

let productosCotizacion = [];


/* ============================================================
   CARGAR CLIENTES
============================================================ */

async function cargarClientes() {

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    "clientes"
                )
            );


        snap.forEach(docu => {

            const cliente =
                docu.data();


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                docu.id;


            option.textContent =
                cliente.nombre ||
                "Cliente sin nombre";


            option.dataset.nombre =
                cliente.nombre || "";


            selectCliente.appendChild(
                option
            );

        });

    }

    catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        alert(
            "No se pudieron cargar los clientes."
        );

    }

}


/* ============================================================
   CARGAR PRODUCTOS
============================================================ */

async function cargarProductos() {

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    "productos"
                )
            );


        productos = [];


        snap.forEach(docu => {

            const datos =
                docu.data();


            /*
             * Solo productos activos
             */

            if (
                datos.activo === false
            ) {

                return;

            }


            productos.push({

                id:
                    docu.id,

                codigo:
                    datos.codigo ||
                    "",

                descripcion:
                    datos.descripcion ||
                    "Producto sin nombre",

                unidad:
                    datos.unidad ||
                    ""

            });

        });


        /*
         * Orden alfabético
         */

        productos.sort(
            (a, b) =>
                a.descripcion.localeCompare(
                    b.descripcion,
                    "es",
                    {
                        sensitivity: "base"
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
   CARGAR LISTAS DE PRECIOS
============================================================ */

async function cargarListasPrecios() {

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    "listaprecios"
                )
            );


        listasPrecios = [];


        snap.forEach(docu => {

            const datos =
                docu.data();


            listasPrecios.push({

                id:
                    docu.id,

                nombre:
                    datos.nombre ||
                    "Lista sin nombre",

                fecha:
                    datos.fecha ||
                    null,

                productos:
                    Array.isArray(
                        datos.productos
                    )
                        ? datos.productos
                        : []

            });

        });


        /*
         * Ordenar por fecha más reciente
         */

        listasPrecios.sort(
            (a, b) => {

                const fechaA =
                    a.fecha &&
                    typeof a.fecha.toDate === "function"
                        ? a.fecha.toDate().getTime()
                        : 0;


                const fechaB =
                    b.fecha &&
                    typeof b.fecha.toDate === "function"
                        ? b.fecha.toDate().getTime()
                        : 0;


                return fechaB - fechaA;

            }
        );


        /*
         * Limpiar selector
         */

        selectListaPrecios.innerHTML = `

            <option value="">
                Seleccionar lista de precios
            </option>

        `;


        /*
         * Agregar listas
         */

        listasPrecios.forEach(lista => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                lista.id;


            option.textContent =
                lista.nombre;


            selectListaPrecios.appendChild(
                option
            );

        });


        console.log(
            "Listas de precios cargadas:",
            listasPrecios.length
        );

    }

    catch (error) {

        console.error(
            "Error cargando listas de precios:",
            error
        );

        alert(
            "No se pudieron cargar las listas de precios."
        );

    }

}


/* ============================================================
   CAMBIAR LISTA DE PRECIOS
============================================================ */

selectListaPrecios.addEventListener(
    "change",
    () => {

        const id =
            selectListaPrecios.value;


        listaPreciosSeleccionada =
            listasPrecios.find(
                lista =>
                    lista.id === id
            ) || null;


        /*
         * Actualizar precios sugeridos
         */

        renderProductos();

    }
);


/* ============================================================
   BUSCADOR DE PRODUCTO
============================================================ */

function crearBuscadorProducto(
    contenedor,
    productoSeleccionado
) {

    /*
     * INPUT
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
        "producto-nombre";


    /*
     * RESULTADOS
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
     * Producto existente
     */

    if (
        productoSeleccionado
    ) {

        buscador.value =
            productoSeleccionado.nombre ||
            productoSeleccionado.descripcion ||
            "";

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


            const encontrados =
                productos
                    .filter(
                        producto => {

                            const nombre =
                                (
                                    producto.descripcion ||
                                    ""
                                ).toLowerCase();


                            const codigo =
                                (
                                    producto.codigo ||
                                    ""
                                ).toLowerCase();


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
     * Cerrar al hacer click afuera
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
   BUSCAR PRECIO SUGERIDO
============================================================ */

function obtenerPrecioSugerido(
    productoId
) {

    if (
        !listaPreciosSeleccionada
    ) {

        return null;

    }


    const producto =
        listaPreciosSeleccionada.productos.find(
            p =>
                p.productoId === productoId
        );


    if (
        !producto
    ) {

        return null;

    }


    return {

        precio:
            Number(
                producto.precio || 0
            ),

        moneda:
            producto.moneda ||
            "ARS"

    };

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
     * Evitar duplicados
     */

    const fila =
        contenedor.closest(
            ".producto-cotizacion"
        );


    const productoActual =
        fila &&
        fila.dataset.productoId ===
        producto.id;


    const yaExiste =
        productosCotizacion.some(
            p =>
                p.productoId ===
                producto.id
        );


    if (
        yaExiste &&
        !productoActual
    ) {

        alert(
            "⚠️ Este producto ya está agregado a la cotización."
        );

        return;

    }


    /*
     * Guardar producto en la fila
     */

    if (
        fila
    ) {

        fila.dataset.productoId =
            producto.id;


        fila.dataset.codigo =
            producto.codigo;


        fila.dataset.unidad =
            producto.unidad;


        fila.dataset.descripcion =
            producto.descripcion;


        /*
         * Buscar precio sugerido
         */

        const sugerido =
            obtenerPrecioSugerido(
                producto.id
            );


        const moneda =
            fila.querySelector(
                ".producto-moneda"
            );


        const precioInput =
            fila.querySelector(
                ".producto-precio-unitario"
            );


        const precioSugerido =
            fila.querySelector(
                ".precio-sugerido"
            );


        /*
         * Moneda de la lista
         */

        if (
            sugerido &&
            moneda
        ) {

            moneda.value =
                sugerido.moneda;

        }


        /*
         * Precio sugerido
         */

        if (
            sugerido &&
            precioSugerido
        ) {

            precioSugerido.textContent =
                `Precio sugerido: ${formatearPrecio(
                    sugerido.precio,
                    sugerido.moneda
                )}`;

            precioSugerido.style.display =
                "block";

        }

        else if (
            precioSugerido
        ) {

            precioSugerido.textContent =
                listaPreciosSeleccionada
                    ? "Producto sin precio en esta lista"
                    : "Seleccioná una lista de precios";

            precioSugerido.style.display =
                "block";

        }


        /*
         * IMPORTANTE:
         *
         * No ponemos el precio sugerido
         * dentro del input.
         *
         * El usuario puede escribir
         * libremente su precio.
         */

        if (
            precioInput
        ) {

            precioInput.value =
                "";

        }


        buscador.value =
            producto.descripcion;


        resultados.innerHTML =
            "";


        resultados.hidden =
            true;


        actualizarProductosCotizacion();

    }

}


/* ============================================================
   FORMATEAR PRECIO
============================================================ */

function formatearPrecio(
    precio,
    moneda
) {

    const simbolo =
        moneda === "USD"
            ? "USD "
            : moneda === "EUR"
                ? "EUR "
                : "$ ";


    return (
        simbolo +
        Number(
            precio || 0
        ).toLocaleString(
            "es-AR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


/* ============================================================
   CREAR FILA PRODUCTO
============================================================ */

function agregarFilaProducto(
    productoInicial = null
) {

    const tarjeta =
        document.createElement(
            "div"
        );


    tarjeta.className =
        "producto-cotizacion";


    /*
     * ID temporal
     */

    tarjeta.dataset.productoId =
        productoInicial
            ? productoInicial.productoId || ""
            : "";


    /*
     * CABECERA
     */

    const cabecera =
        document.createElement(
            "div"
        );


    cabecera.className =
        "producto-cotizacion-cabecera";


    const titulo =
        document.createElement(
            "strong"
        );


    titulo.textContent =
        "Producto";


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


    btnEliminar.addEventListener(
        "click",
        () => {

            const productoId =
                tarjeta.dataset.productoId;


            productosCotizacion =
                productosCotizacion.filter(
                    p =>
                        p.id !==
                        tarjeta.dataset.id
                );


            tarjeta.remove();


            actualizarProductosCotizacion();

        }
    );


    cabecera.appendChild(
        titulo
    );


    cabecera.appendChild(
        btnEliminar
    );


    tarjeta.appendChild(
        cabecera
    );


    /*
     * CONTENEDOR BUSCADOR
     */

    const contenedorBuscador =
        document.createElement(
            "div"
        );


    contenedorBuscador.className =
        "contenedor-buscador-producto";


    tarjeta.appendChild(
        contenedorBuscador
    );


    /*
     * ID INTERNO DE LA FILA
     */

    tarjeta.dataset.id =
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2);


    /*
     * BUSCADOR
     */

    crearBuscadorProducto(
        contenedorBuscador,
        productoInicial
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


    tarjeta.appendChild(
        unidad
    );


    /*
     * PRECIO
     */

    const bloquePrecio =
        document.createElement(
            "div"
        );


    bloquePrecio.className =
        "producto-precio";


    /*
     * MONEDA
     */

    const moneda =
        document.createElement(
            "select"
        );


    moneda.className =
        "producto-moneda";


    moneda.innerHTML = `

        <option value="USD">
            USD
        </option>

        <option value="ARS">
            ARS
        </option>

        <option value="EUR">
            EUR
        </option>

    `;


    /*
     * Precio editable
     */

    const precioInput =
        document.createElement(
            "input"
        );


    precioInput.type =
        "number";


    precioInput.className =
        "producto-precio-unitario";


    precioInput.placeholder =
        "Precio unitario";


    precioInput.min =
        "0";


    precioInput.step =
        "0.01";


    /*
     * Precio sugerido
     */

    const precioSugerido =
        document.createElement(
            "small"
        );


    precioSugerido.className =
        "precio-sugerido";


    precioSugerido.style.color =
        "#9ca3af";


    precioSugerido.style.fontSize =
        "13px";


    precioSugerido.style.display =
        "block";


    precioSugerido.textContent =
        listaPreciosSeleccionada
            ? "Seleccioná el producto"
            : "Seleccioná una lista de precios";


    /*
     * Recuperar producto inicial
     */

    if (
        productoInicial
    ) {

        if (
            productoInicial.moneda
        ) {

            moneda.value =
                productoInicial.moneda;

        }


        if (
            productoInicial.precioUnitario !== undefined
        ) {

            precioInput.value =
                productoInicial.precioUnitario;

        }


        const sugerido =
            obtenerPrecioSugerido(
                productoInicial.productoId
            );


        if (
            sugerido
        ) {

            precioSugerido.textContent =
                `Precio sugerido: ${formatearPrecio(
                    sugerido.precio,
                    sugerido.moneda
                )}`;

        }

    }


    /*
     * CAMBIO MONEDA
     */

    moneda.addEventListener(
        "change",
        () => {

            actualizarProductosCotizacion();

        }
    );


    /*
     * CAMBIO PRECIO
     */

    precioInput.addEventListener(
        "input",
        () => {

            actualizarProductosCotizacion();

        }
    );


    /*
     * ARMAR BLOQUE PRECIO
     */

    bloquePrecio.appendChild(
        moneda
    );


    bloquePrecio.appendChild(
        precioInput
    );


    bloquePrecio.appendChild(
        precioSugerido
    );


    tarjeta.appendChild(
        bloquePrecio
    );


    /*
     * AGREGAR A LA PÁGINA
     */

    listaProductosEl.appendChild(
        tarjeta
    );


    /*
     * Enfocar nueva fila
     */

    if (
        !productoInicial
    ) {

        const input =
            tarjeta.querySelector(
                ".producto-nombre"
            );


        if (
            input
        ) {

            input.focus();

        }

    }


    actualizarProductosCotizacion();

}


/* ============================================================
   ACTUALIZAR PRODUCTOS
============================================================ */

function actualizarProductosCotizacion() {

    productosCotizacion = [];


    const filas =
        listaProductosEl.querySelectorAll(
            ".producto-cotizacion"
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
                    ".producto-moneda"
                );


            const precio =
                fila.querySelector(
                    ".producto-precio-unitario"
                );


            productosCotizacion.push({

                id:
                    fila.dataset.id,

                productoId:
                    productoId,

                nombre:
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
                        ? precio.value
                        : ""

            });

        }
    );

}


/* ============================================================
   BOTÓN AGREGAR PRODUCTO
============================================================ */

btnAgregarProducto.addEventListener(
    "click",
    () => {

        agregarFilaProducto();

    }
);


/* ============================================================
   FECHA ACTUAL
============================================================ */

function establecerFechaActual() {

    if (
        fechaEl.value
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


    fechaEl.value =
        `${año}-${mes}-${dia}`;

}


/* ============================================================
   GUARDAR COTIZACIÓN
============================================================ */

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        try {

            /*
             * CLIENTE
             */

            if (
                !selectCliente.value
            ) {

                alert(
                    "Seleccioná un cliente."
                );

                selectCliente.focus();

                return;

            }


            const clienteOption =
                selectCliente.options[
                    selectCliente.selectedIndex
                ];


            /*
             * FECHA
             */

            if (
                !fechaEl.value
            ) {

                alert(
                    "Seleccioná una fecha."
                );

                fechaEl.focus();

                return;

            }


            /*
             * NOMBRE
             */

            const nombreCotizacion =
                nombreCotizacionEl.value.trim();


            if (
                !nombreCotizacion
            ) {

                alert(
                    "Ingresá el nombre de la cotización."
                );

                nombreCotizacionEl.focus();

                return;

            }


            /*
             * ACTUALIZAR PRODUCTOS
             */

            actualizarProductosCotizacion();


            /*
             * PRODUCTOS
             */

            if (
                productosCotizacion.length === 0
            ) {

                alert(
                    "Agregá al menos un producto."
                );

                return;

            }


            /*
             * VALIDAR PRODUCTOS
             */

            for (
                const producto
                of productosCotizacion
            ) {

                if (
                    !producto.nombre.trim()
                ) {

                    alert(
                        "Completá el nombre de todos los productos."
                    );

                    return;

                }


                if (
                    producto.precio === "" ||
                    !Number.isFinite(
                        Number(
                            producto.precio
                        )
                    ) ||
                    Number(
                        producto.precio
                    ) < 0
                ) {

                    alert(
                        `Ingresá el precio del producto "${producto.nombre}".`
                    );

                    return;

                }

            }


            /*
             * FECHA FIREBASE
             */

            const partes =
                fechaEl.value.split("-");


            const fechaCotizacion =
                new Date(
                    Number(partes[0]),
                    Number(partes[1]) - 1,
                    Number(partes[2]),
                    12,
                    0,
                    0
                );


            /*
             * DATOS PRODUCTOS
             */

            const productosFinales =
                productosCotizacion.map(
                    producto => ({

                        productoId:
                            producto.productoId,

                        nombre:
                            producto.nombre.trim(),

                        codigo:
                            producto.codigo,

                        unidad:
                            producto.unidad,

                        moneda:
                            producto.moneda,

                        precioUnitario:
                            Number(
                                producto.precio
                            )

                    })
                );


            /*
             * DATOS LISTA DE PRECIOS
             */

            const datosLista =
                listaPreciosSeleccionada
                    ? {

                        listaPreciosId:
                            listaPreciosSeleccionada.id,

                        listaPreciosNombre:
                            listaPreciosSeleccionada.nombre

                    }
                    : {

                        listaPreciosId:
                            "",

                        listaPreciosNombre:
                            ""

                    };


            /*
             * OBJETO FINAL
             */

            const nuevaCotizacion = {

                clienteId:
                    selectCliente.value,

                clienteNombre:
                    clienteOption.dataset.nombre ||
                    clienteOption.textContent,

                nombreCotizacion:
                    nombreCotizacion,

                fecha:
                    Timestamp.fromDate(
                        fechaCotizacion
                    ),

                propuesta:
                    propuestaEl.value ||
                    "",

                dosis:
                    dosisEl.value ||
                    "",

                listaPreciosId:
                    datosLista.listaPreciosId,

                listaPreciosNombre:
                    datosLista.listaPreciosNombre,

                productos:
                    productosFinales,

                observaciones:
                    observacionesEl.value ||
                    "",

                creadoEn:
                    Timestamp.now()

            };


            /*
             * BOTÓN GUARDAR
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


            /*
             * FIRESTORE
             */

            const docRef =
                await addDoc(
                    collection(
                        db,
                        "cotizaciones"
                    ),
                    nuevaCotizacion
                );


            /*
             * IR A COTIZACIÓN
             */

            window.location.href =
                `cotizacion.html?id=${docRef.id}`;

        }

        catch (error) {

            console.error(
                "Error al guardar cotización:",
                error
            );


            alert(
                "Error al guardar la cotización.\n\n" +
                error.message
            );


            const botonGuardar =
                form.querySelector(
                    ".btn-guardar"
                );


            if (
                botonGuardar
            ) {

                botonGuardar.disabled =
                    false;

                botonGuardar.textContent =
                    "💾 Guardar cotización";

            }

        }

    }
);


/* ============================================================
   INICIO
============================================================ */

async function iniciar() {

    establecerFechaActual();


    /*
     * Cargar todo antes de permitir
     * trabajar con productos.
     */

    await Promise.all([

        cargarClientes(),

        cargarProductos(),

        cargarListasPrecios()

    ]);

}


iniciar();
