/* ============================================================
   COTIZACIÓN INLACT
   ============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc
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
   OBTENER ID DE LA COTIZACIÓN
   ============================================================ */

const parametros =
    new URLSearchParams(
        window.location.search
    );


const cotizacionId =
    parametros.get("id");


/* ============================================================
   ELEMENTOS
   ============================================================ */

const empresaEl =
    document.getElementById("empresa");


const fechaEl =
    document.getElementById("fecha");


const nombreCotizacionEl =
    document.getElementById(
        "nombre-cotizacion"
    );


const propuestaEl =
    document.getElementById(
        "propuesta"
    );


const dosisEl =
    document.getElementById(
        "dosis"
    );


const cotizacionEl =
    document.getElementById(
        "cotizacion"
    );


const observacionesEl =
    document.getElementById(
        "observaciones"
    );


const linkPublicoEl =
    document.getElementById(
        "link-publico"
    );


/* ============================================================
   CARGAR COTIZACIÓN
   ============================================================ */

async function cargarCotizacion() {

    /*
     * Verificar ID
     */

    if (!cotizacionId) {

        mostrarError(
            "No se encontró el identificador de la cotización."
        );

        return;

    }


    try {

        /*
         * Buscar documento
         */

        const referencia =
            doc(
                db,
                "cotizaciones",
                cotizacionId
            );


        const resultado =
            await getDoc(
                referencia
            );


        /*
         * Cotización inexistente
         */

        if (!resultado.exists()) {

            mostrarError(
                "La cotización no existe o fue eliminada."
            );

            return;

        }


        /*
         * Datos
         */

        const datos =
            resultado.data();


        console.log(
            "Cotización cargada:",
            datos
        );


        /*
         * PORTADA
         */

        cargarPortada(
            datos
        );


        /*
         * SECCIONES
         */

        cargarPropuesta(
            datos
        );


        cargarDosis(
            datos
        );


        cargarCotizacionProductos(
            datos
        );


        cargarObservaciones(
            datos
        );


        /*
         * LINK PÚBLICO
         */

        cargarLinkPublico();


    }

    catch (error) {

        console.error(
            "Error cargando cotización:",
            error
        );


        mostrarError(
            "No se pudo cargar la cotización."
        );

    }

}


/* ============================================================
   PORTADA
   ============================================================ */

function cargarPortada(
    datos
) {

    /*
     * EMPRESA
     *
     * Solo el nombre.
     */

    if (empresaEl) {

        empresaEl.textContent =
            datos.clienteNombre ||
            "Cliente sin nombre";

    }


    /*
     * FECHA
     */

    if (fechaEl) {

        fechaEl.textContent =
            formatearFecha(
                datos.fecha
            );

    }


    /*
     * NOMBRE COTIZACIÓN
     */

    if (nombreCotizacionEl) {

        nombreCotizacionEl.textContent =
            datos.nombreCotizacion ||
            "Cotización";

    }

}


/* ============================================================
   PROPUESTA
   ============================================================ */

function cargarPropuesta(
    datos
) {

    if (!propuestaEl) {

        return;

    }


    propuestaEl.innerHTML = "";


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        "Propuesta";


    propuestaEl.appendChild(
        titulo
    );


    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "contenido-seccion";


    contenido.textContent =
        datos.propuesta ||
        "Sin propuesta registrada.";


    propuestaEl.appendChild(
        contenido
    );

}


/* ============================================================
   DOSIS
   ============================================================ */

function cargarDosis(
    datos
) {

    if (!dosisEl) {

        return;

    }


    dosisEl.innerHTML = "";


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        "Dosis";


    dosisEl.appendChild(
        titulo
    );


    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "contenido-seccion";


    contenido.textContent =
        datos.dosis ||
        "Sin dosis registrada.";


    dosisEl.appendChild(
        contenido
    );

}


/* ============================================================
   COTIZACIÓN / PRODUCTOS
   ============================================================ */

function cargarCotizacionProductos(
    datos
) {

    if (!cotizacionEl) {

        return;

    }


    cotizacionEl.innerHTML = "";


    /*
     * TÍTULO
     */

    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        "Cotización";


    cotizacionEl.appendChild(
        titulo
    );


    /*
     * Lista de productos
     */

    const productos =
        Array.isArray(
            datos.productos
        )
            ? datos.productos
            : [];


    if (
        productos.length === 0
    ) {

        const vacio =
            document.createElement(
                "p"
            );


        vacio.className =
            "sin-productos";


        vacio.textContent =
            "No hay productos cargados en esta cotización.";


        cotizacionEl.appendChild(
            vacio
        );


        return;

    }


    /*
     * Contenedor
     */

    const tabla =
        document.createElement(
            "div"
        );


    tabla.className =
        "tabla-cotizacion";


    /*
     * ENCABEZADO
     */

    const encabezado =
        document.createElement(
            "div"
        );


    encabezado.className =
        "fila-cotizacion encabezado-cotizacion";


    encabezado.innerHTML = `

        <div>
            Producto
        </div>

        <div>
            Unidad
        </div>

        <div>
            Precio
        </div>

    `;


    tabla.appendChild(
        encabezado
    );


    /*
     * PRODUCTOS
     */

    productos.forEach(
        producto => {

            const fila =
                document.createElement(
                    "div"
                );


            fila.className =
                "fila-cotizacion";


            const nombre =
                producto.nombre ||
                "Producto";


            const unidad =
                producto.unidad ||
                "";


            const moneda =
                producto.moneda ||
                "ARS";


            const precio =
                Number(
                    producto.precioUnitario ||
                    0
                );


            fila.innerHTML = `

                <div class="producto-descripcion">

                    <strong>
                        ${escaparHTML(
                            nombre
                        )}
                    </strong>

                    ${
                        producto.codigo
                            ? `
                                <small>
                                    Código: ${escaparHTML(
                                        producto.codigo
                                    )}
                                </small>
                              `
                            : ""
                    }

                </div>


                <div class="producto-unidad">

                    ${escaparHTML(
                        unidad
                    )}

                </div>


                <div class="producto-precio-final">

                    ${formatearPrecio(
                        precio,
                        moneda
                    )}

                </div>

            `;


            tabla.appendChild(
                fila
            );

        }
    );


    cotizacionEl.appendChild(
        tabla
    );


    /*
     * LISTA DE PRECIOS UTILIZADA
     */

    if (
        datos.listaPreciosNombre
    ) {

        const lista =
            document.createElement(
                "p"
            );


        lista.className =
            "lista-precios-utilizada";


        lista.textContent =
            `Lista de precios: ${datos.listaPreciosNombre}`;


        cotizacionEl.appendChild(
            lista
        );

    }

}


/* ============================================================
   OBSERVACIONES
   ============================================================ */

function cargarObservaciones(
    datos
) {

    if (!observacionesEl) {

        return;

    }


    observacionesEl.innerHTML = "";


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        "Observaciones";


    observacionesEl.appendChild(
        titulo
    );


    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "contenido-seccion";


    contenido.textContent =
        datos.observaciones ||
        "Sin observaciones.";


    observacionesEl.appendChild(
        contenido
    );

}


/* ============================================================
   LINK PÚBLICO
   ============================================================ */

function cargarLinkPublico() {

    if (!linkPublicoEl) {

        return;

    }


    const url =
        `${window.location.origin}${window.location.pathname}?id=${cotizacionId}`;


    linkPublicoEl.value =
        url;


    /*
     * Botón copiar
     */

    const botonCopiar =
        document.getElementById(
            "btn-copiar-link"
        );


    if (botonCopiar) {

        botonCopiar.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        url
                    );


                    botonCopiar.textContent =
                        "✓ Copiado";


                    setTimeout(
                        () => {

                            botonCopiar.textContent =
                                "Copiar link";

                        },
                        1800
                    );

                }

                catch (error) {

                    console.error(
                        "No se pudo copiar el link:",
                        error
                    );

                }

            }
        );

    }

}


/* ============================================================
   FORMATEAR FECHA
   ============================================================ */

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "";

    }


    let fechaReal;


    /*
     * Timestamp de Firebase
     */

    if (
        typeof fecha.toDate ===
        "function"
    ) {

        fechaReal =
            fecha.toDate();

    }

    /*
     * Date
     */

    else if (
        fecha instanceof Date
    ) {

        fechaReal =
            fecha;

    }

    /*
     * String
     */

    else {

        fechaReal =
            new Date(
                fecha
            );

    }


    if (
        Number.isNaN(
            fechaReal.getTime()
        )
    ) {

        return "";

    }


    return fechaReal.toLocaleDateString(
        "es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

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
   ESCAPAR HTML
   ============================================================ */

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


/* ============================================================
   ERROR
   ============================================================ */

function mostrarError(
    mensaje
) {

    /*
     * Si existe el contenido blanco,
     * mostramos el error ahí.
     */

    const contenido =
        document.querySelector(
            ".contenido-blanco"
        );


    if (contenido) {

        contenido.innerHTML = `

            <div class="error-cotizacion">

                <h2>
                    No se pudo cargar la cotización
                </h2>

                <p>
                    ${escaparHTML(
                        mensaje
                    )}
                </p>

            </div>

        `;

        return;

    }


    alert(
        mensaje
    );

}


/* ============================================================
   MENÚ LATERAL
   ============================================================ */

function iniciarMenu() {

    const botones =
        document.querySelectorAll(
            ".menu-cotizacion button[data-seccion]"
        );


    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        boton.dataset.seccion;


                    const seccion =
                        document.getElementById(
                            id
                        );


                    if (!seccion) {

                        return;

                    }


                    seccion.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                }
            );

        }
    );

}


/* ============================================================
   INICIO
   ============================================================ */

async function iniciar() {

    iniciarMenu();

    await cargarCotizacion();

}


iniciar();
